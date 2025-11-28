import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimize log level based on environment
const logLevel: ('query' | 'error' | 'warn')[] = env.NODE_ENV === 'production' 
  ? ['error']
  : ['query', 'error', 'warn'];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevel,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;



