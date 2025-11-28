# GGOG Test Kılavuzu

Bu dokümantasyon, GGOG projesindeki iyileştirmelerin nasıl test edileceğini açıklar.

## Hızlı Başlangıç

```bash
# Tüm testleri çalıştır
npm run test

# Belirli bir test kategorisini çalıştır
npm run test:env          # Environment variables
npm run test:upload      # File upload security
npm run test:password    # Password policy
npm run test:xss         # XSS protection
npm run test:validation  # Input validation
npm run test:date        # Date utilities
```

## Test Kategorileri

### 1. Environment Variables Validation

Environment değişkenlerinin doğru şekilde validate edildiğini test eder.

**Test Senaryoları:**
- Eksik DATABASE_URL
- Geçersiz DATABASE_URL formatı
- Eksik NEXTAUTH_SECRET
- Kısa NEXTAUTH_SECRET (< 32 karakter)
- Geçerli environment değişkenleri

**Beklenen Sonuç:** Tüm validation kontrolleri çalışmalı, eksik/geçersiz değişkenlerde hata vermeli.

### 2. File Upload Security

Dosya yükleme güvenlik kontrollerini test eder.

**Test Senaryoları:**
- Geçerli image signature'ları (JPEG, PNG, GIF, WebP)
- MIME type spoofing tespiti
- Filename sanitization (path traversal koruması)
- File extension extraction
- İzin verilen MIME type'lar

**Beklenen Sonuç:** 
- Sadece geçerli image dosyaları kabul edilmeli
- Spoof edilmiş MIME type'lar tespit edilmeli
- Tehlikeli dosya adları sanitize edilmeli

### 3. Password Policy

Şifre politikası kontrollerini test eder.

**Test Senaryoları:**
- Minimum 8 karakter kontrolü
- Büyük harf kontrolü
- Küçük harf kontrolü
- Rakam kontrolü
- Özel karakter kontrolü
- Geçerli şifreler

**Beklenen Sonuç:** 
- Zayıf şifreler reddedilmeli
- Güçlü şifreler kabul edilmeli
- Her gereksinim ayrı ayrı kontrol edilmeli

### 4. XSS Protection

XSS koruma mekanizmalarını test eder.

**Test Senaryoları:**
- Script tag temizleme
- Event handler kaldırma
- JavaScript protocol kaldırma
- iframe/object/embed kaldırma
- Güvenli HTML koruma
- Tehlikeli HTML tespiti

**Beklenen Sonuç:**
- Tüm tehlikeli HTML elementleri temizlenmeli
- Güvenli HTML korunmalı
- XSS payload'ları etkisiz hale getirilmeli

### 5. Input Validation

Zod validation schema'larını test eder.

**Test Senaryoları:**
- Email format validation
- Contact form validation
- Member application validation
- User creation validation

**Beklenen Sonuç:**
- Geçersiz input'lar reddedilmeli
- Geçerli input'lar kabul edilmeli
- Detaylı validation mesajları gösterilmeli

### 6. Date Utilities

Date utility fonksiyonlarını test eder.

**Test Senaryoları:**
- Türkçe locale ile tarih formatlama
- Geçersiz tarih handling
- Geçmiş/gelecek tarih tespiti
- ISO string dönüşümü

**Beklenen Sonuç:**
- Tarihler doğru formatlanmalı
- Geçersiz tarihler null döndürmeli
- Timezone handling doğru olmalı

## Manuel Test Senaryoları

### Senaryo 1: Kullanıcı Oluşturma Akışı

1. Admin paneline giriş yap (`/login-admin`)
2. Kullanıcılar sayfasına git (`/admin/users`)
3. "Yeni Kullanıcı" butonuna tıkla
4. **Test 1:** Geçersiz email gir (örn: "invalid-email")
   - Beklenen: Email validation hatası görmeli
5. **Test 2:** Zayıf şifre gir (örn: "123456")
   - Beklenen: Password policy hatası görmeli
6. **Test 3:** Geçerli bilgilerle formu doldur
   - Beklenen: Kullanıcı başarıyla oluşturulmalı
7. **Test 4:** 5+ kullanıcıyı hızlıca oluşturmayı dene
   - Beklenen: Rate limiting devreye girmeli (429 hatası)

### Senaryo 2: File Upload Akışı

1. Admin paneline giriş yap
2. Slider veya Event sayfasına git
3. Image upload butonuna tıkla
4. **Test 1:** Geçerli bir image dosyası yükle (JPEG, PNG)
   - Beklenen: Başarıyla yüklenmeli
5. **Test 2:** Zararlı dosya yükle (exe, script dosyası)
   - Beklenen: Reddedilmeli, "Invalid file type" hatası
6. **Test 3:** Büyük dosya yükle (>5MB)
   - Beklenen: "File size exceeds 5MB limit" hatası
7. **Test 4:** MIME type spoofing denemesi (dosya uzantısı .jpg ama içerik farklı)
   - Beklenen: Magic bytes kontrolü ile reddedilmeli

### Senaryo 3: XSS Protection Akışı

1. Admin paneline giriş yap
2. Rich text editor ile içerik oluştur (Event veya Announcement)
3. **Test 1:** Script tag ekle: `<script>alert('XSS')</script>`
   - Beklenen: Script tag temizlenmeli
4. **Test 2:** Event handler ekle: `<p onclick="alert('XSS')">Click</p>`
   - Beklenen: onclick attribute kaldırılmalı
5. **Test 3:** İçeriği görüntüle
   - Beklenen: Güvenli şekilde render edilmeli, script çalışmamalı

### Senaryo 4: Error Handling Akışı

1. **Test 1:** Geçersiz route'a git (örn: `/admin/invalid-route`)
   - Beklenen: 404 sayfası veya forbidden sayfası
2. **Test 2:** Yetkisiz kullanıcı ile admin paneline erişmeyi dene
   - Beklenen: 401/403 hatası, login sayfasına yönlendirme
3. **Test 3:** Database bağlantısını kes ve bir işlem yapmayı dene
   - Beklenen: Generic error message (production'da), detaylı error (development'ta)
4. **Test 4:** Bir component'i crash ettir
   - Beklenen: Error boundary catch etmeli, fallback UI gösterilmeli

## Rate Limiting Testleri

Rate limiting testleri için Redis bağlantısı gerekir:

```bash
# Redis'i başlat
redis-server

# Rate limiting testi için API endpoint'ine çok sayıda request gönder
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/admin/users \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
done
```

**Beklenen Sonuç:** İlk 5 request başarılı olmalı, sonrasında 429 (Too Many Requests) hatası alınmalı.

## Database Index Testleri

Database index'lerinin çalıştığını kontrol etmek için:

```sql
-- PostgreSQL'de EXPLAIN ANALYZE kullan
EXPLAIN ANALYZE SELECT * FROM "User" WHERE role = 'ADMIN';
EXPLAIN ANALYZE SELECT * FROM "Event" WHERE "categoryId" = 'some-id';
EXPLAIN ANALYZE SELECT * FROM "EventApplication" WHERE status = 'pending';
```

**Beklenen Sonuç:** Query plan'da index kullanımı görülmeli (Index Scan veya Index Only Scan).

## Logger Testleri

Logger'ın sensitive data'yı mask ettiğini test etmek için:

1. Production modunda bir API endpoint'ini çağır
2. Log çıktısını kontrol et
3. Password, token gibi alanların `***MASKED***` olarak göründüğünü doğrula

```bash
# Production modunda test
NODE_ENV=production npm run dev
```

## Test Sonuçlarını Yorumlama

### Başarılı Test
- ✅ İşareti: Test beklendiği gibi çalıştı
- Beklenen davranış gözlemlendi

### Başarısız Test
- ❌ İşareti: Test beklendiği gibi çalışmadı
- Hata mesajını kontrol et
- İlgili kod bölümünü gözden geçir

### Test Sonuçları
- Her test kategorisi için ayrı sonuç gösterilir
- Toplam başarı oranı hesaplanır
- Başarısız testler için detaylı bilgi verilir

## Sorun Giderme

### Test Script Çalışmıyor
```bash
# Script'lere execute permission ver
chmod +x scripts/*.ts

# tsx'in yüklü olduğundan emin ol
npm install tsx --save-dev
```

### Import Hataları
- TypeScript path alias'larının doğru yapılandırıldığından emin ol
- `tsconfig.json` dosyasını kontrol et

### Environment Variable Hataları
- `.env` dosyasının mevcut olduğundan emin ol
- Test script'leri kendi environment'larını oluşturur, gerçek `.env` dosyasını kullanmaz

## Sürekli Test

CI/CD pipeline'ında testleri çalıştırmak için:

```yaml
# .github/workflows/test.yml örneği
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
```

## İletişim

Testlerle ilgili sorularınız için issue açabilir veya dokümantasyonu güncelleyebilirsiniz.

