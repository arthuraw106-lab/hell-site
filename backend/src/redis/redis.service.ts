import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (error) => this.logger.error(error.message));
  }

  get instance() {
    return this.client;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
      return;
    }

    await this.client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}
