# Environment Variables Kurulum Rehberi

## Hızlı Başlangıç

### 1. Development Ortamı

```bash
# .env.example dosyasını kopyala
cp .env.example .env

# .env dosyasını düzenle ve değerleri doldur
nano .env  # veya vi .env
```

### 2. Production Ortamı (Sunucu)

```bash
# Production örneğini kopyala
cp .env.production.example .env

# .env dosyasını düzenle
nano .env
```

## Gerekli Environment Variables

### Zorunlu Değişkenler

| Değişken | Açıklama | Örnek Değer |
|----------|----------|-------------|
| `DATABASE_URL` | PostgreSQL bağlantı URL'i | `postgresql://user:pass@host:5432/db?schema=public` |
| `NEXTAUTH_SECRET` | NextAuth gizli anahtarı (min 32 karakter) | `openssl rand -base64 32` ile oluşturun |
| `NEXTAUTH_URL` | NextAuth callback URL'i | `https://ggogd.org` |
| `NEXT_PUBLIC_APP_URL` | Uygulama URL'i | `https://ggogd.org` |

### Opsiyonel Değişkenler

| Değişken | Açıklama | Örnek Değer |
|----------|----------|-------------|
| `REDIS_URL` | Redis bağlantı URL'i | `redis://localhost:6379` |
| `NEXT_PUBLIC_TINYMCE_API_KEY` | TinyMCE editor API key | TinyMCE'den alın |
| `NODE_ENV` | Node environment | `production` veya `development` |

## Güvenli Secret Oluşturma

### NEXTAUTH_SECRET Oluşturma

```bash
# Linux/Mac
openssl rand -base64 32

# Veya Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Veya online tool kullanın (güvenli bir site)
# https://generate-secret.vercel.app/32
```

### Güçlü Database Şifresi Oluşturma

```bash
# Linux/Mac
openssl rand -base64 24

# Veya
openssl rand -hex 16
```

## Docker Compose ile Kullanım

Docker Compose kullanıyorsanız, environment variables docker-compose.yml içinde tanımlanabilir veya `.env` dosyasından okunabilir.

### docker-compose.yml'de Tanımlama

```yaml
environment:
  DATABASE_URL: "postgresql://ggog_user:ggog_password@postgres:5432/ggog_db?schema=public"
  NEXTAUTH_SECRET: "your-secret-here"
  NEXTAUTH_URL: "https://ggogd.org"
  NEXT_PUBLIC_APP_URL: "https://ggogd.org"
```

### .env Dosyası ile Kullanım

docker-compose.yml'de `${VARIABLE_NAME}` syntax'ı kullanılırsa, `.env` dosyasındaki değerler otomatik okunur.

## Environment Variables Doğrulama

Uygulama başlatıldığında `lib/env.ts` dosyası tüm environment variables'ları doğrular. Eksik veya geçersiz değişken varsa uygulama başlamaz ve hata mesajı gösterir.

### Doğrulama Testi

```bash
# Environment validation script'ini çalıştır
npm run test:env
```

## Ortam Bazlı Yapılandırma

### Development

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/ggog_db?schema=public
```

### Production

```env
NODE_ENV=production
NEXTAUTH_URL=https://ggogd.org
NEXT_PUBLIC_APP_URL=https://ggogd.org
DATABASE_URL=postgresql://user:STRONG_PASS@postgres:5432/ggog_db?schema=public
```

## Güvenlik Best Practices

1. ✅ `.env` dosyasını **ASLA** git'e eklemeyin
2. ✅ `.gitignore` dosyasında `.env*` olmalı (`.env.example` hariç)
3. ✅ Production'da güçlü şifreler kullanın
4. ✅ Her ortam için farklı secret'lar kullanın
5. ✅ `.env` dosyası izinlerini kısıtlayın: `chmod 600 .env`
6. ✅ Hassas bilgileri environment variables'da saklayın, kod içinde hardcode etmeyin
7. ✅ `NEXT_PUBLIC_*` ile başlayan değişkenler browser'da görünür, hassas bilgi koymayın

## Sorun Giderme

### "NEXTAUTH_SECRET must be at least 32 characters"

NEXTAUTH_SECRET en az 32 karakter olmalı. Güvenli bir secret oluşturun:

```bash
openssl rand -base64 32
```

### "DATABASE_URL must be a valid URL"

DATABASE_URL formatı doğru olmalı:

```
postgresql://username:password@host:port/database?schema=public
```

### Environment Variables Okunmuyor

1. `.env` dosyasının proje kök dizininde olduğundan emin olun
2. `.env` dosyasında boşluk veya tırnak işareti sorunları olabilir
3. Docker kullanıyorsanız, environment variables'ların container'a geçtiğinden emin olun
4. Next.js'i yeniden başlatın: `npm run dev` veya `npm start`

## Örnek .env Dosyası

```env
# Database
DATABASE_URL="postgresql://ggog_user:ggog_password@localhost:5432/ggog_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://ggogd.org"

# Public
NEXT_PUBLIC_APP_URL="https://ggogd.org"
NEXT_PUBLIC_TINYMCE_API_KEY="your-tinymce-api-key"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Environment
NODE_ENV="production"
```

## İlgili Dosyalar

- `lib/env.ts` - Environment variables validation
- `.env.example` - Development için örnek dosya
- `.env.production.example` - Production için örnek dosya
- `docker-compose.yml` - Docker environment variables

