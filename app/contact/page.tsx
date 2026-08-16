import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import ContactForm from "@/components/contact/ContactForm";
import { getPageHeader } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact | Stories by Akshat",
  description:
    "Get in touch to enquire about wedding, pre-wedding, portrait, or event photography.",
};

export default async function ContactPage() {
  const header = await getPageHeader("contact");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Badge tone="rosewood" className="mb-4">
        {header?.badge}
      </Badge>
      <h1 className="mb-3 font-display text-4xl leading-tight text-ink md:text-5xl">
        {header?.heading}
      </h1>
      {header?.subheading && (
        <p className="mb-10 text-lg text-ink-soft">{header.subheading}</p>
      )}

      <ContactForm />
    </div>
  );
}
