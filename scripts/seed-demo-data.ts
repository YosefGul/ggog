import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Placeholder image URLs - Unsplash kullanıyoruz
const images = {
  slider: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop",
  ],
  partner: [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1553484771-371a605b060b?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=100&fit=crop",
  ],
  event: [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
  ],
  announcement: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
  ],
  about: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop",
  ],
};

async function main() {
  console.log("🌱 Demo veriler yükleniyor...\n");

  // 1. Slider'lar
  console.log("📸 Slider'lar oluşturuluyor...");
  const sliders = await Promise.all([
    prisma.slider.upsert({
      where: { id: "slider-1" },
      update: {},
      create: {
        id: "slider-1",
        title: "GGOG'a Hoş Geldiniz!",
        description: "<p>Genç Girişimciler ve Oyun Geliştiricileri Derneği olarak, oyun geliştirme ekosistemini güçlendirmek için buradayız. Siz de aramıza katılın!</p>",
        image: images.slider[0],
        link: "/etkinlikler",
        linkTitle: "Etkinlikleri Keşfet",
        hasLink: true,
        isActive: true,
        order: 1,
      },
    }),
    prisma.slider.upsert({
      where: { id: "slider-2" },
      update: {},
      create: {
        id: "slider-2",
        title: "Yeni Etkinliklerimiz",
        description: "<p>Her ay düzenlediğimiz etkinliklerle sektörün önde gelen isimleriyle buluşun. Networking ve öğrenme fırsatlarını kaçırmayın!</p>",
        image: images.slider[1],
        link: "/etkinlikler",
        linkTitle: "Hemen Başvur",
        hasLink: true,
        isActive: true,
        order: 2,
      },
    }),
    prisma.slider.upsert({
      where: { id: "slider-3" },
      update: {},
      create: {
        id: "slider-3",
        title: "Üye Olun",
        description: "<p>GGOG üyesi olarak sektördeki gelişmelerden haberdar olun, etkinliklerimize öncelikli erişim sağlayın ve network'ünüzü genişletin.</p>",
        image: images.slider[2],
        link: "/uye-basvuru",
        linkTitle: "Üye Başvurusu Yap",
        hasLink: true,
        isActive: true,
        order: 3,
      },
    }),
  ]);
  console.log(`✅ ${sliders.length} slider oluşturuldu\n`);

  // 2. İş Ortakları
  console.log("🤝 İş Ortakları oluşturuluyor...");
  const partners = await Promise.all([
    prisma.partner.upsert({
      where: { id: "partner-1" },
      update: {},
      create: {
        id: "partner-1",
        name: "TechCorp",
        logo: images.partner[0],
        order: 1,
        isActive: true,
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-2" },
      update: {},
      create: {
        id: "partner-2",
        name: "GameStudio",
        logo: images.partner[1],
        order: 2,
        isActive: true,
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-3" },
      update: {},
      create: {
        id: "partner-3",
        name: "InnovateHub",
        logo: images.partner[2],
        order: 3,
        isActive: true,
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-4" },
      update: {},
      create: {
        id: "partner-4",
        name: "StartupLab",
        logo: images.partner[3],
        order: 4,
        isActive: true,
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-5" },
      update: {},
      create: {
        id: "partner-5",
        name: "DevAcademy",
        logo: images.partner[4],
        order: 5,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${partners.length} iş ortağı oluşturuldu\n`);

  // 3. Hakkımızda İstatistikleri
  console.log("📊 İstatistikler oluşturuluyor...");
  const stats = await Promise.all([
    prisma.aboutStats.upsert({
      where: { id: "stat-1" },
      update: {},
      create: {
        id: "stat-1",
        title: "Kurumsal Üye",
        value: "25+",
        icon: "🏢",
        order: 1,
      },
    }),
    prisma.aboutStats.upsert({
      where: { id: "stat-2" },
      update: {},
      create: {
        id: "stat-2",
        title: "Üniversite Klübü",
        value: "35+",
        icon: "🎓",
        order: 2,
      },
    }),
    prisma.aboutStats.upsert({
      where: { id: "stat-3" },
      update: {},
      create: {
        id: "stat-3",
        title: "Etkinlik Yılda",
        value: "15+",
        icon: "🎉",
        order: 3,
      },
    }),
    prisma.aboutStats.upsert({
      where: { id: "stat-4" },
      update: {},
      create: {
        id: "stat-4",
        title: "Tutku",
        value: "100%",
        icon: "❤️",
        order: 4,
      },
    }),
  ]);
  console.log(`✅ ${stats.length} istatistik oluşturuldu\n`);

  // 4. Etkinlik Kategorileri
  console.log("📁 Etkinlik Kategorileri oluşturuluyor...");
  const gameJamCategory = await prisma.eventCategory.upsert({
    where: { slug: "game-jam" },
    update: {},
    create: {
      name: "Game Jam",
      description: "48 saatlik yoğun oyun geliştirme yarışması",
      slug: "game-jam",
    },
  });

  const workshopCategory = await prisma.eventCategory.upsert({
    where: { slug: "workshop" },
    update: {},
    create: {
      name: "Workshop",
      description: "Uzmanlardan öğrenme fırsatları",
      slug: "workshop",
    },
  });

  const networkingCategory = await prisma.eventCategory.upsert({
    where: { slug: "networking" },
    update: {},
    create: {
      name: "Networking",
      description: "Sektör profesyonelleriyle buluşma etkinlikleri",
      slug: "networking",
    },
  });
  console.log(`✅ ${3} kategori oluşturuldu\n`);

  // 5. Form Alanları (Game Jam için)
  console.log("📝 Form Alanları oluşturuluyor...");
  const formFields = await Promise.all([
    prisma.formField.upsert({
      where: { id: "field-1" },
      update: {},
      create: {
        id: "field-1",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "İsim Soyisim",
        placeholder: "Adınız ve soyadınız",
        isRequired: true,
        order: 1,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-2" },
      update: {},
      create: {
        id: "field-2",
        eventCategoryId: gameJamCategory.id,
        fieldType: "email",
        label: "E-Mail",
        placeholder: "ornek@email.com",
        isRequired: true,
        order: 2,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-3" },
      update: {},
      create: {
        id: "field-3",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Telefon",
        placeholder: "05XX XXX XX XX",
        isRequired: true,
        order: 3,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-4" },
      update: {},
      create: {
        id: "field-4",
        eventCategoryId: gameJamCategory.id,
        fieldType: "date",
        label: "Doğum Tarihi",
        isRequired: true,
        order: 4,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-5" },
      update: {},
      create: {
        id: "field-5",
        eventCategoryId: gameJamCategory.id,
        fieldType: "select",
        label: "Katılım Türü",
        isRequired: true,
        options: ["Bireysel", "Takım", "Kurumsal"],
        order: 5,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-6" },
      update: {},
      create: {
        id: "field-6",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Takım Adı",
        placeholder: "Takım adınızı yazın",
        isRequired: false,
        helpText: "Varsa belirtiniz",
        order: 6,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-7" },
      update: {},
      create: {
        id: "field-7",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "TC Kimlik No",
        placeholder: "TC Kimlik numaranız",
        isRequired: true,
        order: 7,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-8" },
      update: {},
      create: {
        id: "field-8",
        eventCategoryId: gameJamCategory.id,
        fieldType: "textarea",
        label: "Alerjen Bilgisi",
        placeholder: "Alerjen bilgilerinizi yazın",
        isRequired: false,
        helpText: "Varsa belirtiniz",
        order: 8,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-9" },
      update: {},
      create: {
        id: "field-9",
        eventCategoryId: gameJamCategory.id,
        fieldType: "textarea",
        label: "Hastalık Bilgisi",
        placeholder: "Hastalık bilgilerinizi yazın",
        isRequired: false,
        helpText: "Varsa belirtiniz",
        order: 9,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-10" },
      update: {},
      create: {
        id: "field-10",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Acil Durum Kişisi",
        placeholder: "Ad Soyad ve Telefon",
        isRequired: true,
        order: 10,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-11" },
      update: {},
      create: {
        id: "field-11",
        eventCategoryId: gameJamCategory.id,
        fieldType: "select",
        label: "Cinsiyet",
        isRequired: true,
        options: ["Kadın", "Erkek", "Belirtmek İstemiyorum"],
        order: 11,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-12" },
      update: {},
      create: {
        id: "field-12",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Sosyal Medya",
        placeholder: "LinkedIn, Twitter, Instagram vb. linkleriniz",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 12,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-13" },
      update: {},
      create: {
        id: "field-13",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Aktif Çalıştığınız Yerler",
        placeholder: "Şirket, stüdyo veya kurum adı",
        isRequired: false,
        helpText: "Varsa belirtiniz",
        order: 13,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-14" },
      update: {},
      create: {
        id: "field-14",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Eğitim Bilgisi",
        placeholder: "Üniversite, bölüm vb.",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 14,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-15" },
      update: {},
      create: {
        id: "field-15",
        eventCategoryId: gameJamCategory.id,
        fieldType: "number",
        label: "Tecrübe Yıl",
        placeholder: "Oyun geliştirme tecrübeniz (yıl)",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 15,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-16" },
      update: {},
      create: {
        id: "field-16",
        eventCategoryId: gameJamCategory.id,
        fieldType: "text",
        label: "Tercih Edilen Rol",
        placeholder: "Programmer, Designer, Artist vb.",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 16,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-17" },
      update: {},
      create: {
        id: "field-17",
        eventCategoryId: gameJamCategory.id,
        fieldType: "textarea",
        label: "Geçmiş Projeleriniz",
        placeholder: "Daha önce üzerinde çalıştığınız projeler",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 17,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-18" },
      update: {},
      create: {
        id: "field-18",
        eventCategoryId: gameJamCategory.id,
        fieldType: "textarea",
        label: "Jam Deneyimi",
        placeholder: "Daha önce katıldığınız game jam'ler",
        isRequired: false,
        helpText: "Varsa belirtiniz",
        order: 18,
      },
    }),
    prisma.formField.upsert({
      where: { id: "field-19" },
      update: {},
      create: {
        id: "field-19",
        eventCategoryId: gameJamCategory.id,
        fieldType: "textarea",
        label: "Eklemek İstedikleriniz",
        placeholder: "Ek bilgilerinizi buraya yazabilirsiniz",
        isRequired: false,
        helpText: "Opsiyonel",
        order: 19,
      },
    }),
  ]);
  console.log(`✅ ${formFields.length} form alanı oluşturuldu\n`);

  // 6. Etkinlikler
  console.log("🎉 Etkinlikler oluşturuluyor...");
  const futureEvent = await prisma.event.upsert({
    where: { id: "event-1" },
    update: {},
    create: {
      id: "event-1",
      title: "Ankara Game Jam 2025",
      description: "<p>48 saatlik yoğun bir oyun geliştirme maratonu! Türkiye'nin en büyük fiziksel oyun geliştirme etkinliğine katılmak için hemen başvurun. Sektörün uzmanlarıyla tanışın, yeni projeler geliştirin ve network'ünüzü genişletin.</p><p>Etkinlik boyunca mentor desteği, workshop'lar ve ödüller sizleri bekliyor!</p><h3>Etkinlik Detayları</h3><ul><li>48 saatlik yoğun geliştirme süreci</li><li>Mentor desteği ve workshop'lar</li><li>Ödül töreni ve sergi</li><li>Networking fırsatları</li><li>Yemek ve içecek ikramları</li></ul>",
      eventDate: new Date("2025-11-08T10:00:00"),
      location: "Teknopark / Ankara",
      eventType: "Game Jam",
      participantLimit: 350,
      applicationDeadline: new Date("2025-10-06T23:59:59"),
      categoryId: gameJamCategory.id,
      acceptsApplications: true,
      isPastEvent: false,
      showOnHomepage: true,
      order: 1,
      images: {
        create: [
          {
            imageUrl: images.event[0],
            order: 1,
          },
          {
            imageUrl: images.event[1],
            order: 2,
          },
          {
            imageUrl: images.event[2],
            order: 3,
          },
        ],
      },
    },
  });

  const pastEvent = await prisma.event.upsert({
    where: { id: "event-2" },
    update: {},
    create: {
      id: "event-2",
      title: "Unity Workshop Serisi",
      description: "<p>Unity oyun motoru üzerine kapsamlı workshop serimiz tamamlandı. Katılımcılar Unity'nin temel özelliklerinden ileri seviye tekniklere kadar geniş bir yelpazede eğitim aldılar.</p>",
      eventDate: new Date("2025-10-20T14:00:00"),
      location: "Online",
      eventType: "Workshop",
      categoryId: workshopCategory.id,
      acceptsApplications: false,
      isPastEvent: true,
      showOnHomepage: true,
      driveLink: "https://drive.google.com/drive/folders/example",
      details: "<p>Workshop boyunca Unity Editor kullanımı, C# scripting, fizik motorları, animasyon sistemleri ve daha birçok konu ele alındı. Katılımcılar kendi projelerini geliştirme fırsatı buldular.</p>",
      order: 2,
      images: {
        create: [
          {
            imageUrl: images.event[2],
            order: 1,
          },
          {
            imageUrl: images.event[0],
            order: 2,
          },
          {
            imageUrl: images.event[1],
            order: 3,
          },
        ],
      },
    },
  });

  const upcomingEvent = await prisma.event.upsert({
    where: { id: "event-3" },
    update: {},
    create: {
      id: "event-3",
      title: "Networking Gecesi",
      description: "<p>Sektör profesyonelleriyle buluşma fırsatı! Oyun geliştirme dünyasından isimlerle tanışın, projelerinizi paylaşın ve işbirlikleri kurun.</p>",
      eventDate: new Date("2025-11-30T19:00:00"),
      location: "Ankara",
      eventType: "Networking",
      participantLimit: 100,
      applicationDeadline: new Date("2025-11-25T23:59:59"),
      categoryId: networkingCategory.id,
      acceptsApplications: true,
      isPastEvent: false,
      showOnHomepage: true,
      order: 3,
      images: {
        create: [
          {
            imageUrl: images.event[1],
            order: 1,
          },
        ],
      },
    },
  });
  console.log(`✅ ${3} etkinlik oluşturuldu\n`);

  // 7. Duyurular
  console.log("📢 Duyurular oluşturuluyor...");
  const announcements = await Promise.all([
    prisma.announcement.upsert({
      where: { id: "announcement-1" },
      update: {},
      create: {
        id: "announcement-1",
        title: "Yeni Üyelik Kampanyası Başladı!",
        description: "<p>GGOG'a üye olan herkese özel indirimler ve avantajlar! Şimdi üye olun ve sektördeki gelişmelerden ilk siz haberdar olun.</p><ul><li>Etkinliklere öncelikli erişim</li><li>Özel workshop'lara katılım hakkı</li><li>Networking fırsatları</li></ul>",
        image: images.announcement[0],
        link: "/uye-basvuru",
        linkTitle: "Hemen Üye Ol",
        isActive: true,
        order: 1,
        publishedAt: new Date(),
      },
    }),
    prisma.announcement.upsert({
      where: { id: "announcement-2" },
      update: {},
      create: {
        id: "announcement-2",
        title: "Game Jam Etkinliği Kayıtları Açıldı",
        description: "<p>Aralık ayında düzenlenecek Ankara Game Jam 2025 etkinliği için kayıtlar başladı! Sınırlı kontenjan için hemen başvurun.</p>",
        image: images.announcement[1],
        link: "/etkinlikler",
        linkTitle: "Detayları Gör",
        isActive: true,
        order: 2,
        publishedAt: new Date(),
      },
    }),
    prisma.announcement.upsert({
      where: { id: "announcement-3" },
      update: {},
      create: {
        id: "announcement-3",
        title: "Yeni İş Ortaklarımız",
        description: "<p>GGOG ailesine katılan yeni iş ortaklarımızı duyurmaktan mutluluk duyuyoruz. Birlikte daha güçlü bir ekosistem inşa ediyoruz!</p>",
        isActive: true,
        order: 3,
        publishedAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ ${announcements.length} duyuru oluşturuldu\n`);

  // 8. Settings
  console.log("⚙️ Ayarlar oluşturuluyor...");
  await prisma.settings.upsert({
    where: { key: "footer" },
    update: {},
    create: {
      key: "footer",
      type: "footer",
      value: {
        address: "Teknopark, Ankara, Türkiye",
        phone: "+90 312 XXX XX XX",
        email: "info@ggog.org.tr",
        socialMedia: {
          facebook: "https://facebook.com/ggog",
          twitter: "https://twitter.com/ggog",
          instagram: "https://instagram.com/ggog",
          linkedin: "https://linkedin.com/company/ggog",
        },
      },
    },
  });

  await prisma.settings.upsert({
    where: { key: "contact" },
    update: {},
    create: {
      key: "contact",
      type: "contact",
      value: {
        address: "Teknopark, Ankara, Türkiye",
        phone: "+90 312 XXX XX XX",
        email: "info@ggog.org.tr",
      },
    },
  });

  await prisma.settings.upsert({
    where: { key: "about" },
    update: {},
    create: {
      key: "about",
      type: "about",
      value: {
        content: "<h2>Genç Girişimciler ve Oyun Geliştiricileri Derneği</h2><p>Genç Girişimciler ve Oyun Geliştiricileri Derneği (GGOG), oyun geliştirme ekosistemini güçlendirmek ve genç girişimcileri desteklemek amacıyla kurulmuş bir dernektir.</p><h3>Misyonumuz</h3><p>Misyonumuz, Türkiye'deki oyun geliştirme topluluğunu bir araya getirmek, bilgi paylaşımını artırmak ve sektördeki profesyonellerin gelişimine katkıda bulunmaktır.</p>",
        contentBottom: "<h3>Faaliyetlerimiz</h3><p>Düzenli olarak gerçekleştirdiğimiz etkinlikler, workshop'lar ve networking organizasyonları ile üyelerimizin hem teknik hem de profesyonel gelişimlerine destek oluyoruz.</p><ul><li>Oyun geliştirme workshop'ları</li><li>Networking etkinlikleri</li><li>Teknik seminerler</li><li>Mentorluk programları</li></ul>",
        images: [
          { url: images.about[0], order: 0 },
          { url: images.about[1], order: 1 },
          { url: images.about[2], order: 2 },
          { url: images.about[3], order: 3 },
          { url: images.about[4], order: 4 },
        ],
      },
    },
  });

  await prisma.settings.upsert({
    where: { key: "legal" },
    update: {},
    create: {
      key: "legal",
      type: "legal",
      value: {
        privacyPolicy: "<h2>Gizlilik Politikası</h2><p>Bu gizlilik politikası, Genç Girişimciler ve Oyun Geliştiricileri Derneği (GGOG) tarafından yönetilen web sitesinin kullanımı sırasında toplanan kişisel bilgilerin nasıl kullanıldığını açıklar.</p><h3>Toplanan Bilgiler</h3><p>Web sitemizi kullanırken şu bilgileri toplayabiliriz:</p><ul><li>İletişim bilgileri (ad, soyad, e-posta, telefon)</li><li>Üyelik başvuru bilgileri</li><li>Etkinlik başvuru bilgileri</li><li>İletişim formu gönderileri</li></ul><h3>Bilgilerin Kullanımı</h3><p>Toplanan bilgiler şu amaçlarla kullanılır:</p><ul><li>Üyelik ve etkinlik başvurularını işleme</li><li>İletişim taleplerini yanıtlama</li><li>Duyuru ve haberler gönderme</li><li>İstatistiksel analizler</li></ul><h3>Bilgilerin Korunması</h3><p>Kişisel bilgileriniz güvenli bir şekilde saklanır ve üçüncü taraflarla paylaşılmaz.</p>",
        termsOfService: "<h2>Kullanım Koşulları</h2><p>Bu kullanım koşulları, Genç Girişimciler ve Oyun Geliştiricileri Derneği (GGOG) web sitesinin kullanımına ilişkin kuralları belirler.</p><h3>Kabul</h3><p>Bu web sitesini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.</p><h3>Kullanım Kuralları</h3><ul><li>Web sitesini yasalara uygun şekilde kullanmalısınız</li><li>Başkalarının haklarına saygı göstermelisiniz</li><li>Zararlı içerik paylaşmamalısınız</li><li>Telif haklarına uymalısınız</li></ul><h3>Sorumluluk Reddi</h3><p>Web sitesinde yer alan bilgiler genel bilgilendirme amaçlıdır ve hukuki tavsiye niteliği taşımaz.</p><h3>Değişiklikler</h3><p>Bu kullanım koşulları herhangi bir zamanda değiştirilebilir.</p>",
      },
    },
  });
  console.log("✅ Ayarlar oluşturuldu\n");

  // 9. Organ Kategorileri ve Üyeleri
  console.log("🏛️ Organ Kategorileri ve Üyeleri oluşturuluyor...");
  
  const yonetimKurulu = await prisma.organCategory.upsert({
    where: { id: "organ-category-1" },
    update: {},
    create: {
      id: "organ-category-1",
      name: "Yönetim Kurulu",
      description: "Derneğin yönetiminden sorumlu organ",
      order: 1,
      isActive: true,
    },
  });

  const denetlemeKurulu = await prisma.organCategory.upsert({
    where: { id: "organ-category-2" },
    update: {},
    create: {
      id: "organ-category-2",
      name: "Denetleme Kurulu",
      description: "Derneğin mali ve idari işlerini denetleyen organ",
      order: 2,
      isActive: true,
    },
  });

  const disiplinKurulu = await prisma.organCategory.upsert({
    where: { id: "organ-category-3" },
    update: {},
    create: {
      id: "organ-category-3",
      name: "Disiplin Kurulu",
      description: "Dernek üyelerinin disiplin işlerinden sorumlu organ",
      order: 3,
      isActive: true,
    },
  });

  // Yönetim Kurulu Üyeleri
  const yonetimMembers = await Promise.all([
    prisma.organMember.upsert({
      where: { id: "organ-member-1" },
      update: {},
      create: {
        id: "organ-member-1",
        categoryId: yonetimKurulu.id,
        firstName: "Ahmet",
        lastName: "Yılmaz",
        department: "Bilgisayar Mühendisliği",
        role: "Başkan",
        order: 1,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-2" },
      update: {},
      create: {
        id: "organ-member-2",
        categoryId: yonetimKurulu.id,
        firstName: "Ayşe",
        lastName: "Demir",
        department: "Yazılım Geliştirme",
        role: "Başkan Yardımcısı",
        order: 2,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-3" },
      update: {},
      create: {
        id: "organ-member-3",
        categoryId: yonetimKurulu.id,
        firstName: "Mehmet",
        lastName: "Kaya",
        department: "Oyun Tasarımı",
        role: "Genel Sekreter",
        order: 3,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-4" },
      update: {},
      create: {
        id: "organ-member-4",
        categoryId: yonetimKurulu.id,
        firstName: "Zeynep",
        lastName: "Şahin",
        department: "Proje Yönetimi",
        role: "Sayman",
        order: 4,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-5" },
      update: {},
      create: {
        id: "organ-member-5",
        categoryId: yonetimKurulu.id,
        firstName: "Can",
        lastName: "Özkan",
        department: "İletişim ve Pazarlama",
        role: "Üye",
        order: 5,
        isActive: true,
      },
    }),
  ]);

  // Denetleme Kurulu Üyeleri
  const denetlemeMembers = await Promise.all([
    prisma.organMember.upsert({
      where: { id: "organ-member-6" },
      update: {},
      create: {
        id: "organ-member-6",
        categoryId: denetlemeKurulu.id,
        firstName: "Fatma",
        lastName: "Arslan",
        department: "Mali İşler",
        role: "Başkan",
        order: 1,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-7" },
      update: {},
      create: {
        id: "organ-member-7",
        categoryId: denetlemeKurulu.id,
        firstName: "Ali",
        lastName: "Çelik",
        department: "Muhasebe",
        role: "Üye",
        order: 2,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-8" },
      update: {},
      create: {
        id: "organ-member-8",
        categoryId: denetlemeKurulu.id,
        firstName: "Elif",
        lastName: "Yıldız",
        department: "Denetim",
        role: "Üye",
        order: 3,
        isActive: true,
      },
    }),
  ]);

  // Disiplin Kurulu Üyeleri
  const disiplinMembers = await Promise.all([
    prisma.organMember.upsert({
      where: { id: "organ-member-9" },
      update: {},
      create: {
        id: "organ-member-9",
        categoryId: disiplinKurulu.id,
        firstName: "Burak",
        lastName: "Aydın",
        department: "Hukuk",
        role: "Başkan",
        order: 1,
        isActive: true,
      },
    }),
    prisma.organMember.upsert({
      where: { id: "organ-member-10" },
      update: {},
      create: {
        id: "organ-member-10",
        categoryId: disiplinKurulu.id,
        firstName: "Selin",
        lastName: "Koç",
        department: "İnsan Kaynakları",
        role: "Üye",
        order: 2,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${3} organ kategorisi ve ${yonetimMembers.length + denetlemeMembers.length + disiplinMembers.length} üye oluşturuldu\n`);

  console.log("🎉 Tüm demo veriler başarıyla yüklendi!");
  console.log("\n📋 Özet:");
  console.log(`- ${sliders.length} Slider`);
  console.log(`- ${partners.length} İş Ortağı`);
  console.log(`- ${stats.length} İstatistik`);
  console.log(`- 3 Etkinlik Kategorisi`);
  console.log(`- ${formFields.length} Form Alanı`);
  console.log(`- 3 Etkinlik`);
  console.log(`- ${announcements.length} Duyuru`);
  console.log(`- 4 Ayar`);
  console.log(`- 3 Organ Kategorisi`);
  console.log(`- ${yonetimMembers.length + denetlemeMembers.length + disiplinMembers.length} Organ Üyesi`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



