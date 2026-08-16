-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhilosophyItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PhilosophyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageHeader" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTeaser" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "blurb" TEXT NOT NULL,

    CONSTRAINT "CategoryTeaser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT 'every gallery, a story',
    "heroHeading" TEXT NOT NULL DEFAULT 'Wedding & portrait photography, told in golden-hour light.',
    "heroImageUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=80',
    "heroImageAlt" TEXT NOT NULL DEFAULT 'A couple walking through a golden field at sunset',
    "ctaPrimaryLabel" TEXT NOT NULL DEFAULT 'View Portfolio',
    "ctaSecondaryLabel" TEXT NOT NULL DEFAULT 'Enquire',
    "featuredBadge" TEXT NOT NULL DEFAULT 'Recent Stories',
    "featuredHeading" TEXT NOT NULL DEFAULT 'Featured Galleries',
    "categoriesHeading" TEXT NOT NULL DEFAULT 'What We Shoot',
    "testimonialsHeading" TEXT NOT NULL DEFAULT 'Testimonials',
    "closingHeading" TEXT NOT NULL DEFAULT 'Let''s tell your story next.',
    "closingSubtext" TEXT NOT NULL DEFAULT 'Available for weddings, pre-weddings, portraits, and events across India.',
    "closingCtaLabel" TEXT NOT NULL DEFAULT 'Get in Touch',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL,
    "badge" TEXT NOT NULL DEFAULT 'About',
    "heading" TEXT NOT NULL DEFAULT 'Hi, I''m Akshat.',
    "bioParagraph1" TEXT NOT NULL DEFAULT 'I''ve spent the last decade photographing weddings, portraits, and the small, unrepeatable moments in between. I started with a borrowed film camera at a cousin''s wedding and never really put it down.',
    "bioParagraph2" TEXT NOT NULL DEFAULT 'My approach is simple: stay out of the way, watch closely, and wait for the light to do most of the work. I''m drawn to golden hour, unscripted laughter, and the quiet minutes before a ceremony begins — the parts most people forget to notice until they see the photos.',
    "bioParagraph3" TEXT NOT NULL DEFAULT 'When I''m not shooting, I''m usually developing film in a makeshift darkroom, scouting new locations, or getting embarrassingly emotional at other people''s weddings.',
    "photoUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80',
    "photoAlt" TEXT NOT NULL DEFAULT 'Akshat, photographer',
    "ctaLabel" TEXT NOT NULL DEFAULT 'Work With Me',
    "philosophyHeading" TEXT NOT NULL DEFAULT 'My Philosophy',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL DEFAULT 'Stories by Akshat — Wedding & Portrait Photography',
    "siteDescription" TEXT NOT NULL DEFAULT 'Warm, editorial wedding and portrait photography by Akshat. Stories told in golden-hour light.',
    "footerTagline" TEXT NOT NULL DEFAULT 'Wedding, portrait & event photography — every gallery is a story, developed frame by frame.',
    "footerSignature" TEXT NOT NULL DEFAULT 'with love, Akshat',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/storiesbyakshat/',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageHeader_slug_key" ON "PageHeader"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTeaser_category_key" ON "CategoryTeaser"("category");
