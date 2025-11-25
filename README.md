# GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği

Modern ve kapsamlı bir dernek yönetim sistemi. Next.js 16, TypeScript, Prisma ve PostgreSQL ile geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Veritabanı Kurulumu](#veritabanı-kurulumu)
- [Admin Kullanıcı Oluşturma](#admin-kullanıcı-oluşturma)
- [Geliştirme](#geliştirme)
- [Proje Yapısı](#proje-yapısı)
- [Rol ve Yetkiler](#rol-ve-yetkiler)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## ✨ Özellikler

### Public Website
- 🏠 **Ana Sayfa**: Hero slider, iş ortakları, hakkımızda, etkinlikler ve duyurular bölümleri
- 📅 **Etkinlikler**: Etkinlik listesi, detay sayfaları ve dinamik başvuru formları
- 📢 **Duyurular**: Duyuru listesi ve detay sayfaları
- 🏛️ **Organlarımız**: Organ kategorileri ve üyeleri
- 👥 **Üye Başvurusu**: Online üye başvuru formu
- 📧 **Newsletter**: E-posta abonelik sistemi
- 📱 **Responsive Tasarım**: Mobil uyumlu, modern UI/UX
- 📊 **Analytics**: Kullanıcı hareketlerini takip eden analytics sistemi

### Admin Panel
- 🔐 **Role-Based Access Control (RBAC)**: 5 farklı rol seviyesi (SUPER_ADMIN, ADMIN, EDITOR, MODERATOR, VIEWER)
- 📊 **Dashboard**: Kapsamlı istatistikler, trend göstergeleri ve son aktiviteler
- 📈 **Analytics Dashboard**: Detaylı kullanıcı analitikleri ve grafikler
- 📝 **İçerik Yönetimi**:
  - Slider yönetimi
  - Etkinlik yönetimi (dinamik form alanları ile)
  - Duyuru yönetimi
  - Kategori yönetimi
  - İş ortağı yönetimi
  - İstatistik yönetimi
  - Organ kategorileri ve üyeleri
- 📋 **Başvuru Yönetimi**:
  - Etkinlik başvuruları (filtreleme, durum değiştirme, Excel export)
  - Üye başvuruları (filtreleme, durum değiştirme, Excel export)
- 📜 **Log Sistemi**: Tüm admin işlemlerinin kaydı (sadece admin kullanıcılar görebilir)
- 👥 **Kullanıcı Yönetimi**: Kullanıcı oluşturma, düzenleme ve silme (sadece SUPER_ADMIN)
- ⚙️ **Ayarlar**: Site ayarları yönetimi
- 📥 **Excel Export**: Başvurular ve loglar için Excel export özelliği
- 📱 **Mobil Uyumlu**: Admin paneli tamamen mobil uyumlu, responsive tasarım

## 🛠️ Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Form Management**: React Hook Form + Zod
- **Rich Text Editor**: TinyMCE
- **Excel Export**: ExcelJS
- **Icons**: Lucide React

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- PostgreSQL 14+
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd ggog
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**

`.env` dosyası oluşturun:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ggog?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis (opsiyonel, cache için)
REDIS_URL="redis://localhost:6379"
```

4. **Veritabanını hazırlayın**
```bash
# Prisma client'ı generate edin
npm run db:generate

# Veritabanı migration'larını çalıştırın
npm run db:migrate

# Veya development için push kullanın
npm run db:push
```

5. **Admin kullanıcı oluşturun** (aşağıdaki bölüme bakın)

6. **Development server'ı başlatın**
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 🗄️ Veritabanı Kurulumu

### PostgreSQL ile Docker

```bash
docker-compose up -d
```

Bu komut PostgreSQL container'ını başlatır. Veritabanı bilgileri `docker-compose.yml` dosyasında tanımlıdır.

### Manuel Kurulum

PostgreSQL'i manuel olarak kurduysanız, veritabanını oluşturun:

```sql
CREATE DATABASE ggog;
```

Sonra `.env` dosyasındaki `DATABASE_URL`'i güncelleyin.

## 👤 Admin Kullanıcı Oluşturma

İlk admin kullanıcısını oluşturmak için:

```bash
npm run db:generate
tsx scripts/create-admin.ts
```

Script size email ve şifre soracak. Oluşturulan kullanıcı varsayılan olarak `SUPER_ADMIN` rolüne sahip olacaktır.

Admin paneline `/login-admin` adresinden giriş yapabilirsiniz.

## 💻 Geliştirme

### Kullanılabilir Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint

# Prisma Studio (veritabanı GUI)
npm run db:studio

# Demo data oluşturma
npm run db:seed

# Demo başvurular oluşturma
npm run db:demo-applications
```

### Kod Yapısı

```
ggog/
├── app/                    # Next.js App Router sayfaları
│   ├── admin/             # Admin panel sayfaları
│   ├── api/               # API routes
│   └── [public-pages]/    # Public website sayfaları
├── components/            # React component'leri
│   ├── admin/            # Admin panel component'leri
│   └── ui/               # UI component'leri (shadcn/ui)
├── lib/                  # Utility fonksiyonları
├── prisma/               # Prisma schema ve migrations
├── public/               # Static dosyalar
└── scripts/              # Utility script'leri
```

## 🔐 Rol ve Yetkiler

Sistem 5 farklı rol seviyesine sahiptir:

### SUPER_ADMIN
- Tüm yetkilere sahip
- Kullanıcı yönetimi
- Log görüntüleme
- Tüm içerik yönetimi

### ADMIN
- Kullanıcı yönetimi hariç tüm yetkiler
- İçerik yönetimi
- Başvuru yönetimi
- Ayarlar

### EDITOR
- İçerik yönetimi (etkinlikler, duyurular, slider'lar, vb.)
- Başvuru görüntüleme (yönetim yok)

### MODERATOR
- Sadece başvuru yönetimi
- Başvuruları onaylama/reddetme

### VIEWER
- Sadece dashboard görüntüleme
- Read-only erişim

## 📡 API Endpoints

### Public API
- `GET /api/public/sliders` - Slider'ları getir
- `GET /api/public/events` - Etkinlikleri getir
- `GET /api/public/announcements` - Duyuruları getir
- `GET /api/public/partners` - İş ortaklarını getir
- `GET /api/public/stats` - İstatistikleri getir
- `GET /api/public/organ-categories` - Organ kategorilerini getir

### Admin API
- `GET/POST /api/admin/*` - Admin işlemleri (authentication gerekli)
- `GET /api/admin/analytics` - Analytics verileri
- `GET /api/admin/logs` - Admin logları
- `GET /api/admin/*/export` - Excel export endpoint'leri

### Application API
- `POST /api/events/[id]/apply` - Etkinlik başvurusu
- `POST /api/member/apply` - Üye başvurusu
- `POST /api/newsletter/subscribe` - Newsletter aboneliği
- `POST /api/contact/submit` - İletişim formu

## 🚢 Deployment

### Vercel Deployment

1. Vercel hesabınıza giriş yapın
2. Yeni proje oluşturun ve repository'yi bağlayın
3. Environment değişkenlerini ekleyin:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Build komutunu ayarlayın: `npm run build`
5. Deploy edin

### Diğer Platformlar

Next.js uygulaması herhangi bir Node.js hosting platformunda çalışabilir:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

**Önemli**: Production'da mutlaka:
- `NEXTAUTH_SECRET` güçlü bir secret key olmalı
- `DATABASE_URL` production veritabanına işaret etmeli
- SSL sertifikası aktif olmalı

## 📝 Notlar

- Admin paneli `/admin` route'unda bulunur
- Login sayfası `/login-admin` route'unda bulunur
- Tüm admin route'ları authentication ve permission kontrolünden geçer
- Public sayfalar authentication gerektirmez
- Analytics sistemi otomatik olarak kullanıcı hareketlerini takip eder
- Excel export özelliği başvurular ve loglar için mevcuttur

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 📞 İletişim

Sorularınız için issue açabilir veya doğrudan iletişime geçebilirsiniz.

---

**GGOG** - Genç Girişimciler ve Oyun Geliştiricileri Derneği © 2024

