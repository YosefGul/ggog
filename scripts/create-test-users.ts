import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const testUsers = [
  {
    email: "superadmin@ggog.com",
    password: "superadmin123",
    name: "Super Admin",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "admin@ggog.com",
    password: "admin123",
    name: "Admin",
    role: "ADMIN" as const,
  },
  {
    email: "editor@ggog.com",
    password: "editor123",
    name: "Editör",
    role: "EDITOR" as const,
  },
  {
    email: "moderator@ggog.com",
    password: "moderator123",
    name: "Moderatör",
    role: "MODERATOR" as const,
  },
  {
    email: "viewer@ggog.com",
    password: "viewer123",
    name: "Görüntüleyici",
    role: "VIEWER" as const,
  },
];

async function createTestUsers() {
  try {
    console.log("Test kullanıcıları oluşturuluyor...\n");

    for (const userData of testUsers) {
      // Kullanıcı zaten var mı kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⚠️  ${userData.email} zaten mevcut, güncelleniyor...`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
          },
        });
        console.log(`✅ ${userData.email} güncellendi (Rol: ${userData.role})\n`);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
          },
        });
        console.log(`✅ ${userData.email} oluşturuldu (Rol: ${userData.role})\n`);
      }
    }

    console.log("\n📋 Test Kullanıcıları:");
    console.log("=" .repeat(60));
    testUsers.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Şifre: ${user.password}`);
      console.log(`Rol: ${user.role}`);
      console.log("-".repeat(60));
    });
  } catch (error) {
    console.error("Hata:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();

