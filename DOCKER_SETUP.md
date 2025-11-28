# Docker Kurulum Rehberi

## Ön Gereksinimler

- Docker ve Docker Compose yüklü olmalı
- Sunucuda yeterli disk alanı (en az 2GB)

## Kurulum Adımları

### 1. Environment Variables Ayarlama

`.env` dosyası oluşturun veya docker-compose.yml içindeki environment variables'ları düzenleyin:

```bash
NEXT_PUBLIC_APP_URL=https://alanadiniz.com
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://alanadiniz.com
NEXT_PUBLIC_TINYMCE_API_KEY=your-tinymce-key
```

### 2. Docker Compose ile Başlatma

```bash
# Tüm servisleri başlat (build dahil)
docker-compose up -d --build

# Logları izle
docker-compose logs -f app

# Sadece app servisini yeniden build et
docker-compose build app
docker-compose up -d app
```

### 3. Veritabanı Migration ve Seed

```bash
# App container'ına gir
docker exec -it ggog_app sh

# Prisma migration çalıştır
npx prisma migrate deploy

# Veya db push (development için)
npx prisma db push

# Prisma Client generate et
npx prisma generate

# Süper admin ve test kullanıcıları oluştur
npx tsx scripts/create-test-users.ts

# Demo verileri yükle (opsiyonel)
npm run db:seed
```

### 4. Servisleri Kontrol Etme

```bash
# Tüm servislerin durumunu kontrol et
docker-compose ps

# Health check'leri kontrol et
docker-compose ps --format "table {{.Name}}\t{{.Status}}"

# App servisinin loglarını görüntüle
docker-compose logs app

# Veritabanına bağlan
docker exec -it ggog_postgres psql -U ggog_user -d ggog_db
```

### 5. Sorun Giderme

#### App başlamıyor:
```bash
# Logları kontrol et
docker-compose logs app

# Container'ı yeniden başlat
docker-compose restart app

# Container'ı sil ve yeniden oluştur
docker-compose rm -f app
docker-compose up -d --build app
```

#### Veritabanı bağlantı hatası:
```bash
# Postgres container'ının çalıştığını kontrol et
docker-compose ps postgres

# Postgres loglarını kontrol et
docker-compose logs postgres

# Veritabanını yeniden başlat
docker-compose restart postgres
```

#### Build hatası:
```bash
# Build cache'i temizle
docker-compose build --no-cache app

# Tüm image'ları temizle ve yeniden build et
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### 6. Production İçin Öneriler

1. **Güvenlik:**
   - `.env` dosyasını git'e eklemeyin
   - Production'da güçlü `NEXTAUTH_SECRET` kullanın
   - Database şifrelerini güçlü yapın

2. **Performans:**
   - Redis cache kullanımını aktif edin
   - Database connection pooling ayarlarını optimize edin
   - CDN kullanın (statik dosyalar için)

3. **Monitoring:**
   - Health check endpoint'i: `http://localhost:3000/api/health`
   - Logları düzenli kontrol edin
   - Disk kullanımını izleyin

### 7. Backup ve Restore

```bash
# Database backup
docker exec ggog_postgres pg_dump -U ggog_user ggog_db > backup.sql

# Database restore
docker exec -i ggog_postgres psql -U ggog_user ggog_db < backup.sql

# Volume backup
docker run --rm -v ggog_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### 8. Servisleri Durdurma

```bash
# Tüm servisleri durdur (veriler korunur)
docker-compose stop

# Tüm servisleri durdur ve sil (veriler korunur)
docker-compose down

# Tüm servisleri durdur, sil ve volume'ları da sil (DİKKAT: Veriler silinir!)
docker-compose down -v
```

## Port Yapılandırması

- **App:** 3000 (Next.js)
- **PostgreSQL:** 5432 (sadece development için açık)
- **Redis:** 6379 (sadece development için açık)

Production'da PostgreSQL ve Redis portlarını dışarıya açmayın, sadece app container'ından erişilebilir olmalı.

