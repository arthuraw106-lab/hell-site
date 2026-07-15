import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import type { Response } from 'express';

@Controller()
export class PlaceholderController {
  @Public()
  @Get('placeholder-cover')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'public, max-age=86400')
  getCover(@Query('title') title: string, @Res() res: Response) {
    const text = title || 'Hell Manhwa';
    const color1 = '#11111a';
    const color2 = '#1a1035';
    const accent = '#c8102e';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <defs>
    <linearGradient id="bg" y1="0" y2="1">
      <stop offset="0%" stop-color="${color2}"/>
      <stop offset="100%" stop-color="${color1}"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" x2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1200" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="4" fill="url(#acc)"/>
  <text x="400" y="620" text-anchor="middle" font-family="system-ui,sans-serif" font-size="42" font-weight="900" fill="white" opacity="0.9">${text}</text>
  <text x="400" y="680" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="white" opacity="0.4">Hell Manhwa</text>
</svg>`;

    res.send(Buffer.from(svg));
  }
}