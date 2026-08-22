import type { Metadata } from "next";
import { Fraunces, Inter, Cormorant_Garamond, Caveat, Josefin_Sans } from "next/font/google";
import localFont from "next/font/local";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ClosingCta from "@/components/layout/ClosingCta";
import { getSiteSettings, getHomepageContent } from "@/lib/content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** "AKSHAT" in the wordmark — Akshat's actual brand font (see Logo.tsx). */
const josefinSans = Josefin_Sans({
  variable: "--font-logo-akshat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

/** "stories by" in the wordmark — Akshat's actual brand script font (see
 * Logo.tsx). Not a Google Font, so it's self-hosted from app/fonts/. */
const buongiornoRastellino = localFont({
  src: "./fonts/BuongiornoRastellino.otf",
  variable: "--font-logo-script",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://storiesbyakshat.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.siteTitle,
      template: "%s",
    },
    description: settings.siteDescription,
    openGraph: {
      siteName: "Stories by Akshat",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, homepage] = await Promise.all([getSiteSettings(), getHomepageContent()]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${cormorantGaramond.variable} ${caveat.variable} ${josefinSans.variable} ${buongiornoRastellino.variable} h-full antialiased`}
    >
      <body className="film-grain min-h-full flex flex-col bg-linen text-ink font-body">
        <Nav />
        <main className="flex-1">{children}</main>
        <ClosingCta
          heading={homepage.closingHeading}
          subtext={homepage.closingSubtext}
          ctaLabel={homepage.closingCtaLabel}
          phone={settings.contactPhone}
        />
        <Footer
          tagline={settings.footerTagline}
          signature={settings.footerSignature}
          instagramUrl={settings.instagramUrl}
        />
      </body>
    </html>
  );
}
