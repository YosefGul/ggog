import { prisma } from "../lib/prisma";

async function migrateUserRoles() {
  try {
    console.log("Kullanıcı rolleri güncelleniyor...");

    // Tüm mevcut kullanıcıları SUPER_ADMIN yap
    const result = await prisma.user.updateMany({
      data: {
        role: "SUPER_ADMIN",
      },
    });

    console.log(`✅ ${result.count} kullanıcı SUPER_ADMIN rolüne güncellendi.`);
  } catch (error) {
    console.error("Hata:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserRoles();

