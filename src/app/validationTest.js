import prisma from "../../src/lib/prisma"; // Correct relative path to prisma

const testUpdateDomain = async () => {
  try {
    const updatedDomain = await prisma.domain.update({
      where: { id: 14 }, // Replace with a valid ID from your database
      data: {
        url: "https://updated-example.com", // Replace with test data
        priority: 2,
        isBlocked: false,
        blockedAt: null,
        shortLinkId: null,
      },
    });

    console.log("Domain updated successfully:", updatedDomain);
  } catch (error) {
    console.error("Prisma update test failed:", error);
  }
};

testUpdateDomain();
