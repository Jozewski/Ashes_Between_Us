import "dotenv/config";
import { AVATARS } from "../lib/mockData.js";
import { prisma } from "../lib/prisma.js";

async function seedAvatars() {
  let count = 0;

  for (const [index, avatar] of AVATARS.entries()) {
    const data = {
      name: avatar.name,
      trait: avatar.trait,
      description: avatar.description,
      backstory: avatar.backstory,
      imageUrl: avatar.imageUrl,
      futureImageUrl: avatar.futureImageUrl,
      futureImageByState: avatar.futureImageByState,
      startingStats: avatar.startingStats,
      sortOrder: index,
    };

    await prisma.avatar.upsert({
      where: { id: avatar.id },
      create: { id: avatar.id, ...data },
      update: data,
    });

    count += 1;
  }

  console.log(`AVATARS_SEEDED: ${count}`);
}

seedAvatars()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
