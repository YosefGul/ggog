# Docker Compose Sorun Giderme Rehberi

## Exit Code 1 Hatası

### 1. Build Hatası Kontrolü

```bash
# Build loglarını detaylı göster
docker-compose build --progress=plain app

# Sadece build yap, çalıştırma
docker-compose build app
```

### 2. Port Çakışması Kontrolü

```bash
# 3000, 5432, 6379 portlarının kullanımını kontrol et
netstat -tulpn | grep -E ':(3000|5432|6379)'

# Veya
lsof -i :3000
lsof -i :5432
lsof -i :6379
```

Eğer portlar kullanılıyorsa, docker-compose.yml'de port numaralarını değiştirin.

### 3. Volume Path Sorunu

```bash
# Uploads klasörünü oluştur
mkdir -p public/uploads
chmod 755 public/uploads

# Veya docker-compose.yml'den volume satırını kaldırın (geçici)
```

### 4. Environment Variables Kontrolü

```bash
# .env dosyası var mı kontrol et
ls -la .env

# Environment variables'ları kontrol et
docker-compose config
```

### 5. Docker Compose Versiyonu

```bash
# Docker Compose versiyonunu kontrol et
docker-compose --version

# Eğer eski versiyon kullanıyorsanız, docker compose (v2) kullanın
docker compose version
```

### 6. Detaylı Log Kontrolü

```bash
# Tüm servislerin loglarını görüntüle
docker-compose logs

# Sadece app servisinin logları
docker-compose logs app

# Son 100 satır
docker-compose logs --tail=100 app

# Gerçek zamanlı log takibi
docker-compose logs -f app
```

### 7. Container Durumu Kontrolü

```bash
# Tüm container'ların durumunu kontrol et
docker-compose ps

# Çalışan container'ları listele
docker ps -a

# Container'a gir ve kontrol et
docker exec -it ggog_app sh
```

### 8. Temiz Başlangıç

```bash
# Tüm container'ları durdur ve sil
docker-compose down

# Volume'ları da silmek isterseniz (DİKKAT: Veriler silinir!)
docker-compose down -v

# Image'ları temizle
docker-compose rm -f
docker system prune -a

# Yeniden build ve başlat
docker-compose up -d --build
```

### 9. Health Check Sorunları

Health check başarısız oluyorsa:

```bash
# Health check'i geçici olarak devre dışı bırak
# docker-compose.yml'de healthcheck bölümünü yorum satırı yapın

# Veya health check'i manuel test et
docker exec ggog_app node -e "require('http').get('http://localhost:3000/api/health', (r) => console.log(r.statusCode))"
```

### 10. Prisma Migration Sorunları

```bash
# Container'a gir
docker exec -it ggog_app sh

# Prisma migration çalıştır
npx prisma migrate deploy

# Veya db push (development için)
npx prisma db push

# Prisma Client generate et
npx prisma generate
```

### 11. Yaygın Hata Mesajları ve Çözümleri

#### "Cannot connect to the Docker daemon"
```bash
# Docker servisinin çalıştığını kontrol et
sudo systemctl status docker
sudo systemctl start docker
```

#### "Bind for 0.0.0.0:3000 failed: port is already allocated"
```bash
# Portu kullanan process'i bul ve durdur
lsof -i :3000
kill -9 <PID>
```

#### "no such file or directory: ./public/uploads"
```bash
# Klasörü oluştur
mkdir -p public/uploads
```

#### "Error response from daemon: driver failed programming external connectivity"
```bash
# Docker network'i yeniden başlat
sudo systemctl restart docker
```

### 12. Plesk Özel Sorunlar

Plesk kullanıyorsanız:

```bash
# Docker Compose dosyasının path'ini kontrol et
# Plesk genellikle /var/www/vhosts/domain.com/httpdocs kullanır

# Doğru dizinde olduğunuzdan emin olun
cd /var/www/vhosts/ggogd.org/httpdocs

# Docker Compose'u çalıştır
docker-compose up -d --build
```

### 13. Debug Modu

```bash
# Verbose modda çalıştır
docker-compose --verbose up -d

# Veya
COMPOSE_HTTP_TIMEOUT=200 docker-compose up -d --build
```

### 14. Log Dosyasına Kaydet

```bash
# Logları dosyaya kaydet
docker-compose up -d --build 2>&1 | tee docker-compose.log
```

## Hata Mesajını Paylaşın

Eğer hala sorun yaşıyorsanız, şu komutların çıktısını paylaşın:

```bash
# 1. Docker Compose config kontrolü
docker-compose config > docker-config.txt

# 2. Build logları
docker-compose build --progress=plain app > build.log 2>&1

# 3. Container logları
docker-compose logs > logs.txt 2>&1

# 4. Container durumu
docker-compose ps > status.txt 2>&1
```

