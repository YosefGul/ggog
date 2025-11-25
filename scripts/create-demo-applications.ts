import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const turkishFirstNames = [
  "Ahmet", "Mehmet", "Ali", "Mustafa", "Hasan", "Hüseyin", "İbrahim", "İsmail",
  "Yusuf", "Ömer", "Fatma", "Ayşe", "Emine", "Hatice", "Zeynep", "Elif",
  "Merve", "Selin", "Büşra", "Derya", "Cem", "Can", "Burak", "Emre",
  "Kerem", "Arda", "Ege", "Deniz", "Selin", "Zeynep", "Elif", "Ayşe",
];

const turkishLastNames = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk",
  "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
  "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Özkan", "Çakır", "Erdoğan",
];

const occupations = [
  "Oyun Geliştirici", "Yazılım Geliştirici", "UI/UX Tasarımcı", "3D Modelleme Uzmanı",
  "Oyun Tasarımcısı", "Proje Yöneticisi", "Pazarlama Uzmanı", "Grafik Tasarımcı",
  "Animasyon Uzmanı", "Ses Tasarımcısı", "Yapımcı", "Yazar",
];

const companies = [
  "Indie Studio", "GameDev Co.", "Creative Games", "Pixel Studios", "Digital Dreams",
  "Tech Games", "Studio X", "Game Lab", "Creative Hub", "Dev Team",
];

const cities = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Gaziantep",
  "Konya", "Kayseri", "Eskişehir", "Mersin", "Diyarbakır",
];

const preferredRoles = [
  "developer", "designer", "artist", "producer", "marketing", "other",
];

const skills = [
  "Unity, C#, Game Design",
  "Unreal Engine, C++, 3D Modeling",
  "JavaScript, React, Node.js",
  "Photoshop, Illustrator, Figma",
  "Blender, Maya, Substance Painter",
  "Python, Django, PostgreSQL",
  "Mobile Game Development, Flutter",
  "VR/AR Development, Unity",
];

const motivations = [
  "Oyun geliştirme alanında kendimi geliştirmek ve sektörde deneyim kazanmak istiyorum.",
  "GGOG'un misyonuna katkıda bulunmak ve oyun geliştiricileriyle network kurmak istiyorum.",
  "Oyun geliştirme topluluğunun bir parçası olmak ve projelerde yer almak istiyorum.",
  "Yeni teknolojiler öğrenmek ve oyun geliştirme konusunda uzmanlaşmak istiyorum.",
  "Oyun endüstrisinde kariyer yapmak ve profesyonel bağlantılar kurmak istiyorum.",
];

const expectations = [
  "Dernekten teknik workshop'lar ve eğitimler bekliyorum.",
  "Oyun geliştirme projelerinde yer almak ve deneyim kazanmak istiyorum.",
  "Sektör profesyonelleriyle tanışmak ve mentorluk almak istiyorum.",
  "Game jam'lere katılmak ve yarışmalarda yer almak istiyorum.",
  "Oyun geliştirme araçları ve teknolojileri hakkında bilgi almak istiyorum.",
];

const gameDevExperiences = [
  "Unity ile 2 yıl deneyimim var. Birkaç mobil oyun geliştirdim.",
  "Unreal Engine kullanarak 3D oyunlar geliştiriyorum. 3 yıl deneyimim var.",
  "Indie oyun geliştiricisiyim. Steam'de yayınlanmış bir oyunum var.",
  "Game jam'lere düzenli katılıyorum. Ludum Dare ve Global Game Jam'de projelerim oldu.",
  "Oyun tasarımı ve seviye tasarımı konusunda deneyimliyim.",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${getRandomElement(domains)}`;
}

function getRandomPhone(): string {
  const prefixes = ["0505", "0532", "0533", "0534", "0535", "0536", "0537", "0538", "0539"];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${number}`;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createDemoMemberApplications() {
  console.log("Üye başvuruları oluşturuluyor...\n");

  const statuses = ["pending", "approved", "rejected"];
  const statusWeights = [0.5, 0.3, 0.2]; // %50 pending, %30 approved, %20 rejected

  for (let i = 0; i < 30; i++) {
    const firstName = getRandomElement(turkishFirstNames);
    const lastName = getRandomElement(turkishLastNames);
    const email = getRandomEmail(firstName, lastName);
    const phone = getRandomPhone();
    
    // Status seçimi (weighted random)
    const rand = Math.random();
    let status = "pending";
    if (rand < statusWeights[0]) {
      status = "pending";
    } else if (rand < statusWeights[0] + statusWeights[1]) {
      status = "approved";
    } else {
      status = "rejected";
    }

    const dateOfBirth = getRandomDate(new Date(1990, 0, 1), new Date(2005, 11, 31));
    const createdAt = getRandomDate(new Date(2024, 0, 1), new Date());

    try {
      await prisma.memberApplication.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          city: getRandomElement(cities),
          country: "Türkiye",
          address: `${Math.floor(Math.random() * 100)} Sokak, ${Math.floor(Math.random() * 50)} No`,
          occupation: getRandomElement(occupations),
          company: Math.random() > 0.3 ? getRandomElement(companies) : null,
          preferredRole: getRandomElement(preferredRoles),
          experience: Math.random() > 0.2 ? getRandomElement(gameDevExperiences) : null,
          skills: Math.random() > 0.2 ? getRandomElement(skills) : null,
          gameDevelopmentExperience: Math.random() > 0.3 ? getRandomElement(gameDevExperiences) : null,
          motivation: Math.random() > 0.2 ? getRandomElement(motivations) : null,
          expectations: Math.random() > 0.2 ? getRandomElement(expectations) : null,
          portfolio: Math.random() > 0.5 ? `https://portfolio-${i}.example.com` : null,
          linkedin: Math.random() > 0.4 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : null,
          github: Math.random() > 0.4 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
          website: Math.random() > 0.6 ? `https://${firstName.toLowerCase()}.dev` : null,
          status,
          createdAt,
        },
      });
      console.log(`✅ ${i + 1}/30 - ${firstName} ${lastName} (${status})`);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`⚠️  ${i + 1}/30 - ${email} zaten mevcut, atlanıyor`);
      } else {
        console.error(`❌ ${i + 1}/30 - Hata:`, error.message);
      }
    }
  }

  console.log("\n✅ Üye başvuruları oluşturuldu!\n");
}

async function createDemoEventApplications() {
  console.log("Etkinlik başvuruları oluşturuluyor...\n");

  // Mevcut etkinlikleri al
  const events = await prisma.event.findMany({
    where: {
      isPastEvent: false, // Sadece gelecek etkinlikler
    },
    take: 10,
  });

  if (events.length === 0) {
    console.log("⚠️  Gelecek etkinlik bulunamadı. Önce etkinlik oluşturun.");
    return;
  }

  const formFieldTemplates = [
    {
      name: "Ad Soyad",
      email: "email@example.com",
      phone: "05001234567",
      message: "Bu etkinliğe katılmak istiyorum.",
    },
    {
      fullName: "Ad Soyad",
      email: "email@example.com",
      phoneNumber: "05001234567",
      reason: "Oyun geliştirme konusunda bilgi almak istiyorum.",
    },
    {
      firstName: "Ad",
      lastName: "Soyad",
      email: "email@example.com",
      phone: "05001234567",
      experience: "Unity ile 2 yıl deneyimim var.",
    },
  ];

  const statuses = ["pending", "approved", "rejected"];
  const statusWeights = [0.5, 0.3, 0.2];

  for (let i = 0; i < 50; i++) {
    const event = getRandomElement(events);
    const formTemplate = getRandomElement(formFieldTemplates);
    
    // Her template için farklı veriler
    const formData = { ...formTemplate };
    const firstName = getRandomElement(turkishFirstNames);
    const lastName = getRandomElement(turkishLastNames);
    
    if (formData.name) {
      formData.name = `${firstName} ${lastName}`;
    }
    if (formData.fullName) {
      formData.fullName = `${firstName} ${lastName}`;
    }
    if (formData.firstName) {
      formData.firstName = firstName;
    }
    if (formData.lastName) {
      formData.lastName = lastName;
    }
    if (formData.email) {
      formData.email = getRandomEmail(firstName, lastName);
    }
    if (formData.phone || formData.phoneNumber) {
      const phone = getRandomPhone();
      if (formData.phone) formData.phone = phone;
      if (formData.phoneNumber) formData.phoneNumber = phone;
    }

    const rand = Math.random();
    let status = "pending";
    if (rand < statusWeights[0]) {
      status = "pending";
    } else if (rand < statusWeights[0] + statusWeights[1]) {
      status = "approved";
    } else {
      status = "rejected";
    }

    const createdAt = getRandomDate(new Date(2024, 0, 1), new Date());

    try {
      await prisma.eventApplication.create({
        data: {
          eventId: event.id,
          formData: formData as any,
          status,
          createdAt,
        },
      });
      console.log(`✅ ${i + 1}/50 - ${event.title} (${status})`);
    } catch (error: any) {
      console.error(`❌ ${i + 1}/50 - Hata:`, error.message);
    }
  }

  console.log("\n✅ Etkinlik başvuruları oluşturuldu!\n");
}

async function main() {
  try {
    await createDemoMemberApplications();
    await createDemoEventApplications();
    
    console.log("🎉 Tüm demo veriler başarıyla oluşturuldu!");
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

