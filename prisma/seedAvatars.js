import "dotenv/config";
import { access } from "node:fs/promises";
import path from "node:path";
import { AVATARS } from "../lib/mockData.js";
import { prisma } from "../lib/prisma.js";

async function ensurePublicImageExists(imageUrl, label) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/images/")) {
    throw new Error(`Invalid ${label}: expected a /images/... public path.`);
  }

  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  try {
    await access(filePath);
  } catch {
    throw new Error(`Missing ${label}: ${imageUrl} does not exist at ${filePath}.`);
  }
}

async function seedAvatars() {
  let count = 0;

  for (const [index, avatar] of AVATARS.entries()) {
    await ensurePublicImageExists(avatar.imageUrl, `${avatar.id}.imageUrl`);
    await ensurePublicImageExists(
      avatar.futureImageUrl,
      `${avatar.id}.futureImageUrl`,
    );
    for (const [state, imageUrl] of Object.entries(avatar.futureImageByState ?? {})) {
      await ensurePublicImageExists(imageUrl, `${avatar.id}.futureImageByState.${state}`);
    }

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
