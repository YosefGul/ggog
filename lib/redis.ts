import { createClient, RedisClientType } from 'redis';
import { env } from './env';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

/**
 * Get or create Redis client (lazy initialization)
 */
export function getRedisClient(): RedisClientType | null {
  if (!env.REDIS_URL) {
    return null; // Redis is optional
  }

  if (!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL,
    }) as RedisClientType;

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { error: err });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis client disconnected');
    });
  }

  return redisClient;
}

/**
 * Connect to Redis (lazy load)
 */
export async function connectRedis(): Promise<RedisClientType | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (client.isOpen) {
          clearInterval(checkInterval);
          resolve(client);
        }
      }, 100);
    });
  }

  if (client.isOpen) {
    return client;
  }

  try {
    isConnecting = true;
    await client.connect();
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis', { error });
    // Don't throw - Redis is optional, app should continue without it
    return null;
  } finally {
    isConnecting = false;
  }
}

/**
 * Safe Redis operation with fallback
 */
export async function safeRedisOperation<T>(
  operation: (client: RedisClientType) => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const client = await connectRedis();
    if (!client) {
      return fallback;
    }
    return await operation(client);
  } catch (error) {
    logger.error('Redis operation failed', { error });
    return fallback;
  }
}



