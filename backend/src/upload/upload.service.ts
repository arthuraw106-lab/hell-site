import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadKind } from '@prisma/client';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import unzipper from 'unzipper';

type ExtractedPage = {
  fileName: string;
  url: string;
  key: string;
  index: number;
};

@Injectable()
export class UploadService {
  private readonly s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  });

  constructor(private readonly prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('فایلی ارسال نشده است.');
    }

    const kind = this.detectKind(file.mimetype || '', file.originalname || '');
    const safeExt = extname(file.originalname || '').replace(/[^a-zA-Z0-9.]/g, '');
    const key = `${kind.toLowerCase()}/${randomUUID()}${safeExt}`;
    const contentType = file.mimetype || 'application/octet-stream';

    await this.putObject(key, file.buffer, contentType);

    const url = this.publicUrl(key);

    return this.prisma.upload.create({
      data: {
        userId,
        key,
        url,
        mimeType: contentType,
        size: file.size,
        kind,
      },
    });
  }

  async uploadChapterZip(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('فایل ZIP ارسال نشده است.');
    }

    const isZip =
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed' ||
      file.originalname.toLowerCase().endsWith('.zip');

    if (!isZip) {
      throw new BadRequestException('فقط فایل ZIP معتبر است.');
    }

    const chapterUploadId = randomUUID();
    const safeZipName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
    const zipKey = `chapters/${chapterUploadId}/source-${safeZipName || 'chapter.zip'}`;

    await this.putObject(zipKey, file.buffer, 'application/zip');

    const zipUrl = this.publicUrl(zipKey);

    await this.prisma.upload.create({
      data: {
        userId,
        key: zipKey,
        url: zipUrl,
        mimeType: 'application/zip',
        size: file.size,
        kind: UploadKind.ZIP,
      },
    });

    const directory = await unzipper.Open.buffer(file.buffer);

    const imageEntries = directory.files
      .filter((entry: any) => {
        if (entry.type !== 'File') return false;
        if (entry.path.includes('__MACOSX')) return false;
        return this.isImageFile(entry.path);
      })
      .sort((a: any, b: any) => this.naturalCompare(a.path, b.path));

    if (!imageEntries.length) {
      throw new BadRequestException('داخل فایل ZIP هیچ تصویر معتبری پیدا نشد.');
    }

    if (imageEntries.length > 500) {
      throw new BadRequestException('تعداد صفحات ZIP زیاد است. حداکثر ۵۰۰ تصویر مجاز است.');
    }

    const pages: ExtractedPage[] = [];

    for (let index = 0; index < imageEntries.length; index += 1) {
      const entry = imageEntries[index];
      const buffer = await entry.buffer();
      const ext = extname(entry.path).toLowerCase() || '.jpg';
      const contentType = this.imageContentType(ext);
      const pageNumber = String(index + 1).padStart(4, '0');
      const key = `chapters/${chapterUploadId}/pages/${pageNumber}${ext}`;

      await this.putObject(key, buffer, contentType);

      const url = this.publicUrl(key);

      await this.prisma.upload.create({
        data: {
          userId,
          key,
          url,
          mimeType: contentType,
          size: buffer.length,
          kind: UploadKind.IMAGE,
        },
      });

      pages.push({
        fileName: entry.path,
        url,
        key,
        index: index + 1,
      });
    }

    return {
      zipUrl,
      pages: pages.map((page) => page.url),
      files: pages,
      totalPages: pages.length,
    };
  }

  private async putObject(key: string, body: Buffer, contentType: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  private publicUrl(key: string) {
    const publicBase = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT;
    return `${publicBase}/${process.env.S3_BUCKET}/${key}`;
  }

  private detectKind(mime: string, fileName: string): UploadKind {
    const lower = fileName.toLowerCase();

    if (mime.startsWith('image/') || this.isImageFile(lower)) return UploadKind.IMAGE;
    if (mime.startsWith('audio/') || this.isAudioFile(lower)) return UploadKind.AUDIO;
    if (mime.startsWith('video/') || this.isVideoFile(lower)) return UploadKind.VIDEO;
    if (mime === 'application/pdf' || lower.endsWith('.pdf')) return UploadKind.PDF;
    if (mime.includes('zip') || lower.endsWith('.zip')) return UploadKind.ZIP;

    return UploadKind.OTHER;
  }

  private isImageFile(fileName: string) {
    const lower = fileName.toLowerCase();

    return (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.avif')
    );
  }

  private isAudioFile(fileName: string) {
    const lower = fileName.toLowerCase();

    return (
      lower.endsWith('.mp3') ||
      lower.endsWith('.wav') ||
      lower.endsWith('.ogg') ||
      lower.endsWith('.m4a') ||
      lower.endsWith('.aac') ||
      lower.endsWith('.webm')
    );
  }

  private isVideoFile(fileName: string) {
    const lower = fileName.toLowerCase();

    return (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.mkv') ||
      lower.endsWith('.avi')
    );
  }

  private imageContentType(ext: string) {
    switch (ext.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.avif':
        return 'image/avif';
      default:
        return 'application/octet-stream';
    }
  }

  private naturalCompare(a: string, b: string) {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }
}
