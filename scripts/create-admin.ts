import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Mevcut kullanıcıları kontrol et
  const existingUsers = await prisma.user.findMany();
  
  if (existingUsers.length > 0) {
    console.log("Mevcut kullanıcılar:");
    existingUsers.forEach((user) => {
      console.log(`- Email: ${user.email}, İsim: ${user.name || "Yok"}, Rol: ${user.role}`);
    });
  } else {
    console.log("Veritabanında kullanıcı bulunamadı.");
    
    // Varsayılan admin kullanıcı oluştur
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@ggog.com",
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN",
      },
    });
    
    console.log("\n✅ Varsayılan admin kullanıcı oluşturuldu!");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Şifre: ${defaultPassword}`);
    console.log("\n⚠️  Güvenlik için ilk girişten sonra şifrenizi değiştirmenizi öneririz.");
  }
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



