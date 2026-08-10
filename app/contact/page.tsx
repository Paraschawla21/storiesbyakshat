import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Stories by Akshat",
  description:
    "Get in touch to enquire about wedding, pre-wedding, portrait, or event photography.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Badge tone="rosewood" className="mb-4">
        Contact
      </Badge>
      <h1 className="mb-3 font-display text-4xl leading-tight text-ink md:text-5xl">
        Let&apos;s tell your story.
      </h1>
      <p className="mb-10 text-lg text-ink-soft">
        Fill out the form below with a few details about your event, and
        Akshat will get back to you within 2&ndash;3 days.
      </p>

      <ContactForm />
    </div>
  );
}
