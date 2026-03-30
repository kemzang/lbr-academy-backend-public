import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ===== ADMIN =====
  const adminPassword = bcrypt.hashSync("Admin@1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@lbr-academy.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@lbr-academy.com",
      password: adminPassword,
      fullName: "Administrateur LBR",
      role: "ADMIN",
      enabled: true,
      emailVerified: true,
    },
  });
  console.log("✅ Admin créé (admin@lbr-academy.com / Admin@1234)");

  // ===== CATEGORIES =====
  const categories = [
    { name: "Développement Personnel", description: "Croissance personnelle, mindset et productivité", slug: "developpement-personnel" },
    { name: "Business & Entrepreneuriat", description: "Création d'entreprise, stratégie et gestion", slug: "business-entrepreneuriat" },
    { name: "Finance & Investissement", description: "Gestion financière, investissement et épargne", slug: "finance-investissement" },
    { name: "Marketing & Vente", description: "Stratégies marketing, vente et communication", slug: "marketing-vente" },
    { name: "Technologie & Programmation", description: "Développement web, mobile et logiciel", slug: "technologie-programmation" },
    { name: "Leadership & Management", description: "Gestion d'équipe, leadership et organisation", slug: "leadership-management" },
    { name: "Santé & Bien-être", description: "Santé physique, mentale et nutrition", slug: "sante-bien-etre" },
    { name: "Spiritualité & Foi", description: "Croissance spirituelle et développement de la foi", slug: "spiritualite-foi" },
    { name: "Relations & Communication", description: "Relations interpersonnelles et communication efficace", slug: "relations-communication" },
    { name: "Art & Créativité", description: "Expression artistique, écriture et créativité", slug: "art-creativite" },
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { ...cat, displayOrder: i + 1, active: true },
    });
  }
  console.log(`✅ ${categories.length} catégories créées`);

  // ===== PLANS D'ABONNEMENT =====
  await prisma.subscriptionPlan.upsert({
    where: { name: "Gratuit" },
    update: {},
    create: { name: "Gratuit", description: "Accès aux contenus gratuits", type: "FREE", price: 0, durationDays: 365 },
  });
  await prisma.subscriptionPlan.upsert({
    where: { name: "Premium" },
    update: {},
    create: { name: "Premium", description: "Accès illimité à tous les contenus", type: "PREMIUM", price: 5000, durationDays: 30 },
  });
  console.log("✅ Plans d'abonnement créés (Gratuit + Premium)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
