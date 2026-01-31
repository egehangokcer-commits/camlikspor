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

  // Create Camlikspor dealer (main dealer)
  const camlıksporDealer = await prisma.dealer.upsert({
    where: { slug: "camlikspor" },
    update: {
      heroTitle: "Profesyonel Futbol Ekipmanları",
      heroSubtitle: "Kaliteli formalar, eşofmanlar ve spor aksesuarları ile takımınızı donatın",
      aboutText: "Çamlık Spor Kulübü olarak profesyonel futbol ekipmanları ve spor malzemeleri sunuyoruz.",
      contactPhone: "0532 123 45 67",
      contactEmail: "info@camlikspor.com",
      contactAddress: "Çamlık Mah. Spor Cad. No: 1, İstanbul",
      socialFacebook: "https://facebook.com/camlikspor",
      socialInstagram: "https://instagram.com/camlikspor",
      features: JSON.stringify([
        "Ücretsiz Kargo",
        "Güvenli Ödeme",
        "7/24 Destek",
        "Kolay İade"
      ]),
      isPublicPageActive: true,
    },
    create: {
      name: "Çamlık Spor Kulübü",
      slug: "camlikspor",
      phone: "0532 123 45 67",
      email: "info@camlikspor.com",
      address: "Çamlık Mah. Spor Cad. No: 1, İstanbul",
      isActive: true,
      heroTitle: "Profesyonel Futbol Ekipmanları",
      heroSubtitle: "Kaliteli formalar, eşofmanlar ve spor aksesuarları ile takımınızı donatın",
      aboutText: "Çamlık Spor Kulübü olarak profesyonel futbol ekipmanları ve spor malzemeleri sunuyoruz.",
      contactPhone: "0532 123 45 67",
      contactEmail: "info@camlikspor.com",
      contactAddress: "Çamlık Mah. Spor Cad. No: 1, İstanbul",
      socialFacebook: "https://facebook.com/camlikspor",
      socialInstagram: "https://instagram.com/camlikspor",
      features: JSON.stringify([
        "Ücretsiz Kargo",
        "Güvenli Ödeme",
        "7/24 Destek",
        "Kolay İade"
      ]),
      isPublicPageActive: true,
    },
  });

  console.log("Camlikspor dealer created:", camlıksporDealer.name);

  // Create dealer settings
  await prisma.dealerSettings.upsert({
    where: { dealerId: camlıksporDealer.id },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      currency: "TRY",
      timezone: "Europe/Istanbul",
    },
  });

  // Create product categories
  const formaCategory = await prisma.productCategory.upsert({
    where: {
      dealerId_slug: {
        dealerId: camlıksporDealer.id,
        slug: "formalar",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Formalar",
      slug: "formalar",
      sortOrder: 1,
      isActive: true,
    },
  });

  const esofmanCategory = await prisma.productCategory.upsert({
    where: {
      dealerId_slug: {
        dealerId: camlıksporDealer.id,
        slug: "esofmanlar",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Eşofmanlar",
      slug: "esofmanlar",
      sortOrder: 2,
      isActive: true,
    },
  });

  const ayakkabiCategory = await prisma.productCategory.upsert({
    where: {
      dealerId_slug: {
        dealerId: camlıksporDealer.id,
        slug: "ayakkabilar",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Ayakkabılar",
      slug: "ayakkabilar",
      sortOrder: 3,
      isActive: true,
    },
  });

  const aksesuarCategory = await prisma.productCategory.upsert({
    where: {
      dealerId_slug: {
        dealerId: camlıksporDealer.id,
        slug: "aksesuarlar",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Aksesuarlar",
      slug: "aksesuarlar",
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log("Product categories created");

  // Create sample products
  const products = [
    {
      name: "Profesyonel Maç Forması",
      slug: "profesyonel-mac-formasi",
      description: "Nefes alabilir kumaştan üretilmiş profesyonel maç forması. Ter emici özelliği ile maksimum konfor sağlar.",
      price: 450,
      categoryId: formaCategory.id,
      images: JSON.stringify(["/images/products/forma-1.jpg"]),
    },
    {
      name: "Antrenman Forması",
      slug: "antrenman-formasi",
      description: "Günlük antrenmanlar için ideal, hafif ve dayanıklı forma.",
      price: 250,
      categoryId: formaCategory.id,
      images: JSON.stringify(["/images/products/forma-2.jpg"]),
    },
    {
      name: "Kışlık Eşofman Takımı",
      slug: "kislik-esofman-takimi",
      description: "Soğuk havalarda sıcak tutan, su geçirmez eşofman takımı.",
      price: 850,
      categoryId: esofmanCategory.id,
      images: JSON.stringify(["/images/products/esofman-1.jpg"]),
    },
    {
      name: "Yazlık Eşofman Takımı",
      slug: "yazlik-esofman-takimi",
      description: "Hafif ve hava alan yazlık eşofman takımı.",
      price: 550,
      categoryId: esofmanCategory.id,
      images: JSON.stringify(["/images/products/esofman-2.jpg"]),
    },
    {
      name: "Profesyonel Krampon",
      slug: "profesyonel-krampon",
      description: "Çim sahalar için özel tasarlanmış profesyonel krampon.",
      price: 1200,
      categoryId: ayakkabiCategory.id,
      images: JSON.stringify(["/images/products/krampon-1.jpg"]),
    },
    {
      name: "Halı Saha Ayakkabısı",
      slug: "hali-saha-ayakkabisi",
      description: "Halı saha için ideal, kaymaz tabanlı spor ayakkabısı.",
      price: 750,
      categoryId: ayakkabiCategory.id,
      images: JSON.stringify(["/images/products/ayakkabi-1.jpg"]),
    },
    {
      name: "Futbol Topu - Maç",
      slug: "futbol-topu-mac",
      description: "FIFA onaylı profesyonel maç topu.",
      price: 350,
      categoryId: aksesuarCategory.id,
      images: JSON.stringify(["/images/products/top-1.jpg"]),
    },
    {
      name: "Kaleci Eldiveni",
      slug: "kaleci-eldiveni",
      description: "Profesyonel kaleci eldiveni, ekstra kavrama özelliği.",
      price: 280,
      categoryId: aksesuarCategory.id,
      images: JSON.stringify(["/images/products/eldiven-1.jpg"]),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        dealerId_slug: {
          dealerId: camlıksporDealer.id,
          slug: product.slug,
        },
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
      },
      create: {
        dealerId: camlıksporDealer.id,
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        images: product.images,
        isActive: true,
      },
    });
  }

  console.log("Sample products created");

  // Create a demo branch
  const demoBranch = await prisma.branch.upsert({
    where: {
      dealerId_name: {
        dealerId: camlıksporDealer.id,
        name: "Futbol",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
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
        dealerId: camlıksporDealer.id,
        name: "Istanbul",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
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
        dealerId: camlıksporDealer.id,
        locationId: demoLocation.id,
        name: "Ana Saha",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
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
        dealerId: camlıksporDealer.id,
        name: "2024-2025 Sezonu",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
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
    where: { email: "admin@camlikspor.com" },
    update: {},
    create: {
      email: "admin@camlikspor.com",
      passwordHash: dealerAdminPassword,
      name: "Çamlık Admin",
      role: "DEALER_ADMIN",
      dealerId: camlıksporDealer.id,
      isActive: true,
    },
  });

  console.log("Dealer admin created:", dealerAdmin.email);

  // Create task definitions
  await prisma.taskDefinition.upsert({
    where: {
      dealerId_name: {
        dealerId: camlıksporDealer.id,
        name: "Antrenor",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Antrenor",
      description: "Ana antrenor",
      isActive: true,
    },
  });

  await prisma.taskDefinition.upsert({
    where: {
      dealerId_name: {
        dealerId: camlıksporDealer.id,
        name: "Yardimci Antrenor",
      },
    },
    update: {},
    create: {
      dealerId: camlıksporDealer.id,
      name: "Yardimci Antrenor",
      description: "Yardimci antrenor",
      isActive: true,
    },
  });

  console.log("Task definitions created");

  console.log("\n=== Seed completed ===");
  console.log("\nLogin credentials:");
  console.log("SuperAdmin: admin@futbolokullari.com / Admin123!");
  console.log("Dealer Admin: admin@camlikspor.com / Dealer123!");
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
