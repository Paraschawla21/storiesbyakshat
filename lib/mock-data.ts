export type Category = "WEDDING" | "PRE_WEDDING" | "PORTRAIT" | "EVENT";

export interface GalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
  caption?: string;
}

export interface Gallery {
  id: string;
  title: string;
  slug: string;
  category: Category;
  coverImageUrl: string;
  coverWidth: number;
  coverHeight: number;
  storyText: string;
  eventDate?: string;
  location?: string;
  images: GalleryImage[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  coverWidth: number;
  coverHeight: number;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: string;
}

function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

// Curated warm/golden-hour wedding, portrait & event photography
const photoIds = [
  "photo-1519741497674-611481863552", // wedding rings
  "photo-1465495976277-4387d4b0b4c6", // wedding couple field
  "photo-1465495976277-4387d4b0b4c6",
  "photo-1519225421980-715cb0215aed", // bride
  "photo-1511285560929-80b456fea0bc", // wedding ceremony
  "photo-1520854221256-17451cc331bf", // wedding reception
  "photo-1517841905240-472988babdf9", // couple portrait
  "photo-1503341455253-b2e723bb3dbb", // portrait woman
  "photo-1500048993953-d23a436266cf", // wedding aisle
  "photo-1583939003579-730e3918a45a", // wedding details
  "photo-1594736797933-d0501ba2fe65", // wedding couple sunset
  "photo-1544078751-58fee2d8a03b", // groom
  "photo-1522673607200-164d1b6ce486", // wedding decor
  "photo-1606216794074-735e91aa2c92", // couple dancing
  "photo-1537633552985-df8429e8048b", // portrait man
  "photo-1520854221256-17451cc331bf",
  "photo-1522336284037-91f7da073525", // wedding table
  "photo-1519741497674-611481863552",
  "photo-1519741497674-611481863552", // bride getting ready
  "photo-1508186225823-0963cf9ab0de", // family event
];

function img(
  index: number,
  w: number,
  h: number,
  caption?: string,
): GalleryImage {
  const id = photoIds[index % photoIds.length];
  return {
    id: `img-${index}-${id}`,
    url: unsplash(id, w),
    width: w,
    height: h,
    caption,
  };
}

export const galleries: Gallery[] = [
  {
    id: "g1",
    title: "Meera & Rohan — A Jaipur Wedding",
    slug: "meera-rohan-jaipur-wedding",
    category: "WEDDING",
    coverImageUrl: unsplash(photoIds[1], 1400),
    coverWidth: 1400,
    coverHeight: 1750,
    storyText:
      "Three days of haldi, mehndi, and a sunset pheras ceremony inside a 17th-century haveli. Meera and Rohan wanted their wedding to feel like their relationship — warm, unhurried, full of laughter between the rituals.",
    eventDate: "2025-11-14",
    location: "Jaipur, Rajasthan",
    images: [
      img(1, 1200, 1500, "The first look, courtyard light"),
      img(4, 1200, 800, "Haldi ceremony, marigold everywhere"),
      img(9, 1200, 1600, "Details: bangles and a borrowed dupatta"),
      img(5, 1200, 900, "Baraat arriving at golden hour"),
      img(10, 1200, 1500, "Pheras beneath string lights"),
      img(6, 1200, 1400, "First dance as husband and wife"),
    ],
  },
  {
    id: "g2",
    title: "Anaya & Vikram — Goa Beachside",
    slug: "anaya-vikram-goa-beachside",
    category: "WEDDING",
    coverImageUrl: unsplash(photoIds[10], 1400),
    coverWidth: 1400,
    coverHeight: 1050,
    storyText:
      "An intimate beach wedding with forty guests, bare feet in the sand, and a ceremony timed exactly to sunset. No stage, no shoes, just the ocean as witness.",
    eventDate: "2025-09-02",
    location: "Candolim, Goa",
    images: [
      img(10, 1200, 1500, "Vows exchanged at low tide"),
      img(14, 1200, 900, "Reception under fairy lights"),
      img(2, 1200, 1600, "Anaya, barefoot, veil in the wind"),
      img(13, 1200, 900, "The first dance, sand still on their feet"),
    ],
  },
  {
    id: "g3",
    title: "Kavya — Golden Hour Portraits",
    slug: "kavya-golden-hour-portraits",
    category: "PORTRAIT",
    coverImageUrl: unsplash(photoIds[7], 1400),
    coverWidth: 1400,
    coverHeight: 1750,
    storyText:
      "A quiet solo portrait session in an old orchard, chasing the last twenty minutes of light before dusk.",
    eventDate: "2025-10-20",
    location: "Nashik, Maharashtra",
    images: [
      img(7, 1200, 1500, "Backlit, orchard rows"),
      img(14, 1200, 1500, "Quiet moment, hands folded"),
      img(3, 1200, 1600, "Walking toward the light"),
    ],
  },
  {
    id: "g4",
    title: "Diya's First Birthday",
    slug: "diya-first-birthday",
    category: "EVENT",
    coverImageUrl: unsplash(photoIds[19], 1400),
    coverWidth: 1400,
    coverHeight: 1050,
    storyText:
      "A candid coverage of a first birthday — balloons, cake-smashing chaos, and grandparents unable to stop smiling.",
    eventDate: "2025-08-15",
    location: "Mumbai, Maharashtra",
    images: [
      img(19, 1200, 900, "Balloon arch, morning light"),
      img(11, 1200, 1500, "Cake smash, unfiltered joy"),
      img(8, 1200, 1500, "Three generations together"),
    ],
  },
  {
    id: "g5",
    title: "Ishaan & Priya — Udaipur Palace Wedding",
    slug: "ishaan-priya-udaipur-palace",
    category: "WEDDING",
    coverImageUrl: unsplash(photoIds[16], 1400),
    coverWidth: 1400,
    coverHeight: 1050,
    storyText:
      "A grand three-day celebration inside a lakeside palace — sangeet fireworks, a boat entry for the groom, and a wedding feast that lasted until 2am.",
    eventDate: "2025-12-05",
    location: "Udaipur, Rajasthan",
    images: [
      img(16, 1200, 900, "Groom's boat entry across the lake"),
      img(12, 1200, 1500, "Sangeet, mid-performance"),
      img(0, 1200, 1500, "Rings, close up on marble"),
      img(9, 1200, 1600, "Bridal details before the ceremony"),
    ],
  },
  {
    id: "g6",
    title: "Arjun — Studio Portraits",
    slug: "arjun-studio-portraits",
    category: "PORTRAIT",
    coverImageUrl: unsplash(photoIds[14], 1400),
    coverWidth: 1400,
    coverHeight: 1750,
    storyText:
      "A moody, minimal studio session exploring hard directional light and shadow — a departure from our usual natural-light work.",
    eventDate: "2025-07-11",
    location: "Delhi Studio",
    images: [
      img(14, 1200, 1500, "Profile, single key light"),
      img(7, 1200, 1600, "Hands and jawline detail"),
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "Why We Shoot Weddings on Film (Sometimes)",
    slug: "why-we-shoot-weddings-on-film",
    coverImageUrl: unsplash(photoIds[9], 1400),
    coverWidth: 1400,
    coverHeight: 1050,
    excerpt:
      "There's a texture to film that digital still hasn't matched — grain, color falloff, the discipline of only 36 frames a roll.",
    content:
      "<p>There's a texture to film that digital still hasn't matched — the grain, the color falloff in highlights, the way skin tones render without needing three sliders in post. But more than the look, it's the discipline: 36 frames a roll forces you to actually watch a moment before you press the shutter, instead of spraying and praying.</p><p>We don't shoot every wedding on film — logistics and client timelines don't always allow it — but for ceremonies with beautiful natural light, we'll often bring a second body loaded with Portra 400 alongside our digital kit.</p>",
    tags: ["Film", "Behind the Scenes"],
    publishedAt: "2025-11-20",
  },
  {
    id: "b2",
    title: "Five Things to Do the Morning of Your Wedding",
    slug: "five-things-morning-of-your-wedding",
    coverImageUrl: unsplash(photoIds[18], 1400),
    coverWidth: 1400,
    coverHeight: 1750,
    excerpt:
      "A short, practical list for brides and grooms on how to actually enjoy the morning chaos before the ceremony.",
    content:
      "<p>1. Eat something before hair and makeup starts — you will not have another chance for six hours.</p><p>2. Keep your phone in a drawer, not your hand, for at least the first hour.</p><p>3. Let one person be in charge of logistics so you don't have to be.</p><p>4. Open the curtains — morning window light is the best light you'll get all day for getting-ready photos.</p><p>5. Take thirty seconds, alone, to actually feel it before the room fills up.</p>",
    tags: ["Advice", "Wedding Planning"],
    publishedAt: "2025-10-02",
  },
  {
    id: "b3",
    title: "Inside Meera & Rohan's Jaipur Haveli Wedding",
    slug: "inside-meera-rohan-jaipur-haveli-wedding",
    coverImageUrl: unsplash(photoIds[1], 1400),
    coverWidth: 1400,
    coverHeight: 1050,
    excerpt:
      "A behind-the-lens look at three days of rituals inside a 17th-century haveli — and the light we chased to capture it.",
    content:
      "<p>Some venues do half the work for you. The haveli's central courtyard has a single skylight opening that, at exactly 5:40pm in November, throws a beam of warm light ss the marble floor for about twelve minutes. We built the entire pheras ceremony timing around those twelve minutes.</p><p>See the full gallery from Meera and Rohan's wedding in our Portfolio.</p>",
    tags: ["Wedding Story", "Jaipur"],
    publishedAt: "2025-11-22",
  },
];

export function getGalleryBySlug(slug: string) {
  return galleries.find((g) => g.slug === slug);
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getGalleriesByCategory(category?: Category) {
  if (!category) return galleries;
  return galleries.filter((g) => g.category === category);
}
