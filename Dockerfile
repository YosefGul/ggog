# ######################################################################
# AŞAMA 1: BUILD (Derleme) Aşaması
# ######################################################################
FROM node:18.17.0-alpine AS builder

# Bazı paketler için gerekli olabilecek build araçlarını yükle
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Package dosyalarını kopyala (npm için package-lock.json gereklidir)
COPY package.json package-lock.json* ./

# Bağımlılıkları yükle (dev dependencies dahil - build için gerekli)
RUN npm ci

# Prisma schema ve diğer gerekli dosyaları kopyala
COPY prisma ./prisma

# Prisma Client'ı generate et
RUN npx prisma generate

# Tüm proje dosyalarını kopyala
COPY . .

# Next.js uygulamasını production için derle
RUN npm run build

# ######################################################################
# AŞAMA 2: RUN (Çalıştırma) Aşaması
# ######################################################################
FROM node:18.17.0-alpine AS runner

# Uygulamayı çalıştırmak için düşük yetkili bir kullanıcı oluştur
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001

WORKDIR /app

# Production flag'i set et
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone output'tan gerekli dosyaları kopyala
# Standalone modda .next/standalone içinde zaten node_modules, package.json ve server.js var
COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=appuser:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:nodejs /app/public ./public

# Prisma Client ve schema dosyalarını standalone'a kopyala
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma

# Next.js production server'ın çalışacağı port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Kullanıcıyı değiştir
USER appuser

# Next.js production server'ı başlat
EXPOSE 3000

CMD ["node", "server.js"]

