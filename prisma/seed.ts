import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create SuperAdmin user
  const superAdminPassword = await bcrypt.hash("Admin123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@futbolokullari.com" },
    update: {},
    create: {
      email: "admin@futbolokullari.com",
      passwordHash: superAdminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("SuperAdmin created:", superAdmin.email);

  // Create a demo dealer
  const demoDealer = await prisma.dealer.upsert({
    where: { slug: "demo-spor-kulubu" },
    update: {
      // Update landing page fields if dealer already exists
      heroTitle: "Profesyonel Futbol Ekipmanları",
      heroSubtitle: "Kaliteli formalar, eşofmanlar ve spor aksesuarları ile takımınızı donatın",
      aboutText: "Demo Spor Kulübü olarak 2010 yılından bu yana spor malzemeleri sektöründe hizmet vermekteyiz. Kalite ve müşteri memnuniyeti odaklı yaklaşımımızla binlerce sporcuya ulaştık.",
      contactPhone: "0532 123 45 67",
      contactEmail: "info@demospor.com",
      contactAddress: "Atatürk Mah. Spor Cad. No: 42, Kadıköy, İstanbul",
      socialFacebook: "https://facebook.com/demospor",
      socialInstagram: "https://instagram.com/demospor",
      socialTwitter: "https://twitter.com/demospor",
      socialYoutube: "https://youtube.com/demospor",
      features: JSON.stringify([
        "Ücretsiz Kargo",
        "Güvenli Ödeme",
        "7/24 Destek",
        "Kolay İade"
      ]),
      isPublicPageActive: true,
    },
    create: {
      name: "Demo Spor Kulübü",
      slug: "demo-spor-kulubu",
      phone: "0532 123 45 67",
      email: "info@demospor.com",
      address: "Atatürk Mah. Spor Cad. No: 42, Kadıköy, İstanbul",
      isActive: true,
      // Landing page fields
      heroTitle: "Profesyonel Futbol Ekipmanları",
      heroSubtitle: "Kaliteli formalar, eşofmanlar ve spor aksesuarları ile takımınızı donatın",
      aboutText: "Demo Spor Kulübü olarak 2010 yılından bu yana spor malzemeleri sektöründe hizmet vermekteyiz. Kalite ve müşteri memnuniyeti odaklı yaklaşımımızla binlerce sporcuya ulaştık.",
      contactPhone: "0532 123 45 67",
      contactEmail: "info@demospor.com",
      contactAddress: "Atatürk Mah. Spor Cad. No: 42, Kadıköy, İstanbul",
      socialFacebook: "https://facebook.com/demospor",
      socialInstagram: "https://instagram.com/demospor",
      socialTwitter: "https://twitter.com/demospor",
      socialYoutube: "https://youtube.com/demospor",
      features: JSON.stringify([
        "Ücretsiz Kargo",
        "Güvenli Ödeme",
        "7/24 Destek",
        "Kolay İade"
      ]),
      isPublicPageActive: true,
    },
  });

  console.log("Demo dealer created:", demoDealer.name);

  // Create dealer settings
  await prisma.dealerSettings.upsert({
    where: { dealerId: demoDealer.id },
    update: {},
    create: {
      dealerId: demoDealer.id,
      currency: "TRY",
      timezone: "Europe/Istanbul",
    },
  });

  // Create a demo branch
  const demoBranch = await prisma.branch.upsert({
    where: {
      dealerId_name: {
        dealerId: demoDealer.id,
        name: "Futbol",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      name: "Futbol",
      description: "Futbol bransi",
      isActive: true,
    },
  });

  console.log("Demo branch created:", demoBranch.name);

  // Create a demo location
  const demoLocation = await prisma.location.upsert({
    where: {
      dealerId_name: {
        dealerId: demoDealer.id,
        name: "Istanbul",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      name: "Istanbul",
      address: "Istanbul, Turkiye",
      isActive: true,
    },
  });

  console.log("Demo location created:", demoLocation.name);

  // Create a demo facility
  const demoFacility = await prisma.facility.upsert({
    where: {
      dealerId_locationId_name: {
        dealerId: demoDealer.id,
        locationId: demoLocation.id,
        name: "Ana Saha",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      locationId: demoLocation.id,
      name: "Ana Saha",
      capacity: 50,
      isActive: true,
    },
  });

  console.log("Demo facility created:", demoFacility.name);

  // Create a demo period
  const demoPeriod = await prisma.period.upsert({
    where: {
      dealerId_name: {
        dealerId: demoDealer.id,
        name: "2024-2025 Sezonu",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      name: "2024-2025 Sezonu",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-06-30"),
      isActive: true,
    },
  });

  console.log("Demo period created:", demoPeriod.name);

  // Create a dealer admin user
  const dealerAdminPassword = await bcrypt.hash("Dealer123!", 12);

  const dealerAdmin = await prisma.user.upsert({
    where: { email: "bayi@demospor.com" },
    update: {},
    create: {
      email: "bayi@demospor.com",
      passwordHash: dealerAdminPassword,
      name: "Bayi Admin",
      role: "DEALER_ADMIN",
      dealerId: demoDealer.id,
      isActive: true,
    },
  });

  console.log("Dealer admin created:", dealerAdmin.email);

  // Create a demo task definition
  await prisma.taskDefinition.upsert({
    where: {
      dealerId_name: {
        dealerId: demoDealer.id,
        name: "Antrenor",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      name: "Antrenor",
      description: "Ana antrenor",
      isActive: true,
    },
  });

  await prisma.taskDefinition.upsert({
    where: {
      dealerId_name: {
        dealerId: demoDealer.id,
        name: "Yardimci Antrenor",
      },
    },
    update: {},
    create: {
      dealerId: demoDealer.id,
      name: "Yardimci Antrenor",
      description: "Yardimci antrenor",
      isActive: true,
    },
  });

  console.log("Task definitions created");

  console.log("\n=== Seed completed ===");
  console.log("\nLogin credentials:");
  console.log("SuperAdmin: admin@futbolokullari.com / Admin123!");
  console.log("Dealer Admin: bayi@demospor.com / Dealer123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
