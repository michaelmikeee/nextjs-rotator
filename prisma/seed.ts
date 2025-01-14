import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // STEP 1: Create Users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        id: `admin${i}`,
        username: `admin${i}`,
        email: `admin${i}@example.com`,
        password: `admin${i}`,
        name: `Admin ${i}`,
        limit: 5,
      },
    });
    users.push(user);
  }

  // STEP 2: Create ShortLinks
  const shortLinks = [];
  for (let i = 1; i <= 10; i++) {
    const shortLink = await prisma.shortLink.create({
      data: {
        name: `name ${i}`,
        slug: `slug ${i}`,
        userId: users[i % 5].id, // Connect to an existing user
      },
    });
    shortLinks.push(shortLink);
  }

  // STEP 3: Create Domains
  for (let i = 1; i <= 10; i++) {
    await prisma.domain.create({
      data: {
        url: `https://domain${i}.com`,
        userId: users[i % 5].id, // Connect to an existing user
        shortLinkId: shortLinks[i % 10].id, // Connect to an existing shortLink
      },
    });
  }

  console.log("Seeding completed successfully.");
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
