import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  galleries as mockGalleries,
  blogPosts as mockPosts,
} from "../lib/mock-data";

function generatePassword(length = 14) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "akshat@example.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`Admin user already exists for ${adminEmail}, skipping.`);
  } else {
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log("\n===========================================");
    console.log("  Admin account created");
    console.log("  Email:    ", adminEmail);
    console.log("  Password: ", password);
    console.log("  (save this now — it will not be shown again)");
    console.log("===========================================\n");
  }

  // Seed galleries + images from mock data, if none exist yet
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    for (const g of mockGalleries) {
      await prisma.gallery.create({
        data: {
          title: g.title,
          slug: g.slug,
          category: g.category,
          coverImageUrl: g.coverImageUrl,
          coverWidth: g.coverWidth,
          coverHeight: g.coverHeight,
          storyText: g.storyText,
          eventDate: g.eventDate ? new Date(g.eventDate) : null,
          location: g.location,
          published: true,
          images: {
            create: g.images.map((img, i) => ({
              url: img.url,
              width: img.width,
              height: img.height,
              caption: img.caption,
              order: i,
            })),
          },
        },
      });
    }
    console.log(`Seeded ${mockGalleries.length} galleries.`);
  } else {
    console.log("Galleries already exist, skipping gallery seed.");
  }

  const preWeddingCount = await prisma.gallery.count({
    where: { category: "PRE_WEDDING" },
  });
  if (preWeddingCount === 0) {
    await prisma.gallery.create({
      data: {
        title: "Ishita & Rohan — Pre-Wedding in the Hills",
        slug: "ishita-rohan-pre-wedding-hills",
        category: "PRE_WEDDING",
        coverImageUrl:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80",
        coverWidth: 1400,
        coverHeight: 1050,
        storyText:
          "A quiet afternoon in the hills, just the two of them — no ceremony, no guest list, just the easy comfort of two people who already know how this story ends.",
        eventDate: new Date("2025-10-05"),
        location: "Coonoor, Tamil Nadu",
        published: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 900,
              caption: "Golden hour on the ridge",
              order: 0,
            },
            {
              url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 1500,
              caption: "Quiet laughter between takes",
              order: 1,
            },
            {
              url: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 1500,
              order: 2,
            },
            {
              url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 900,
              caption: "Walking back as the light faded",
              order: 3,
            },
          ],
        },
      },
    });
    console.log("Seeded 1 pre-wedding gallery.");
  } else {
    console.log("Pre-wedding galleries already exist, skipping seed.");
  }

  const postCount = await prisma.blogPost.count();
  if (postCount === 0) {
    for (const p of mockPosts) {
      await prisma.blogPost.create({
        data: {
          title: p.title,
          slug: p.slug,
          coverImageUrl: p.coverImageUrl,
          coverWidth: p.coverWidth,
          coverHeight: p.coverHeight,
          content: p.content,
          excerpt: p.excerpt,
          tags: p.tags.join(","),
          published: true,
          publishedAt: new Date(p.publishedAt),
        },
      });
    }
    console.log(`Seeded ${mockPosts.length} blog posts.`);
  } else {
    console.log("Blog posts already exist, skipping post seed.");
  }

  const editorialCount = await prisma.editorialImage.count();
  if (editorialCount === 0) {
    const editorialPhotos = [
      { id: "photo-1515934751635-c81c6bc9a2d8", w: 1200, h: 1500 },
      { id: "photo-1509631179647-0177331693ae", w: 1200, h: 800 },
      { id: "photo-1494790108377-be9c29b29330", w: 1200, h: 1600 },
      { id: "photo-1519085360753-af0119f7cbe7", w: 1200, h: 900 },
      { id: "photo-1526413232644-8a40f03cc03b", w: 1200, h: 1500 },
      { id: "photo-1487412720507-e7ab37603c6f", w: 1200, h: 1500 },
      { id: "photo-1524504388940-b1c1722653e1", w: 1200, h: 900 },
      { id: "photo-1465146344425-f00d5f5c8f07", w: 1200, h: 1600 },
    ];

    for (let i = 0; i < editorialPhotos.length; i++) {
      const p = editorialPhotos[i];
      await prisma.editorialImage.create({
        data: {
          url: `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=1200&q=80`,
          width: p.w,
          height: p.h,
          published: true,
          order: i,
        },
      });
    }
    console.log(`Seeded ${editorialPhotos.length} editorial images.`);
  } else {
    console.log("Editorial images already exist, skipping editorial seed.");
  }

  const editorialVideoCount = await prisma.editorialImage.count({
    where: { type: "VIDEO" },
  });
  if (editorialVideoCount === 0) {
    const maxOrder = await prisma.editorialImage.aggregate({ _max: { order: true } });
    await prisma.editorialImage.create({
      data: {
        type: "VIDEO",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        width: 320,
        height: 176,
        caption: "A short reel-style clip",
        published: true,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    console.log("Seeded 1 editorial video.");
  } else {
    console.log("Editorial video already exists, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
