import type { Metadata } from "next";
import { Fraunces, Inter, Cormorant_Garamond, Caveat } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/content";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${cormorantGaramond.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="film-grain min-h-full flex flex-col bg-linen text-ink font-body">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer
          tagline={settings.footerTagline}
          signature={settings.footerSignature}
          instagramUrl={settings.instagramUrl}
        />
      </body>
    </html>
  );
}
