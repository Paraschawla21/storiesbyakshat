"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Textarea, Select } from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import { validatePhoneNumber } from "@/lib/phone";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().superRefine((value, ctx) => {
    const result = validatePhoneNumber(value);
    if (!result.valid) {
      ctx.addIssue({ code: "custom", message: result.message });
    }
  }),
  eventType: z.enum(["Wedding", "Pre-Wedding", "Portrait", "Event", "Other"]),
  eventDate: z.string().optional(),
  message: z.string().optional(),
  // honeypot — must stay empty
  company: z.string().max(0).optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { eventType: "Wedding", phone: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-marigold/30 bg-paper p-10 text-center"
      >
        <p className="font-accent text-3xl text-marigold-dark">Sent</p>
        <h2 className="mt-3 font-display text-2xl text-ink">
          Thanks for reaching out.
        </h2>
        <p className="mt-3 text-ink-soft">
          Akshat will get back to you within 2&ndash;3 days. In the meantime,
          feel free to browse the{" "}
          <Link href="/portfolio" className="text-marigold-dark underline underline-offset-4">
            portfolio
          </Link>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key="form"
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-5"
      >
        {/* Honeypot field — hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="name"
            label="Name"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                id="phone"
                label="Phone"
                error={errors.phone?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Select id="eventType" label="Event Type" {...register("eventType")}>
            <option value="Wedding">Wedding</option>
            <option value="Pre-Wedding">Pre-Wedding</option>
            <option value="Portrait">Portrait</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <Input
          id="eventDate"
          type="date"
          label="Event Date (optional)"
          error={errors.eventDate?.message}
          {...register("eventDate")}
        />

        <Textarea
          id="message"
          label="Message (optional)"
          placeholder="Tell us about your event, venue, and what you're looking for..."
          error={errors.message?.message}
          {...register("message")}
        />

        <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-2 self-start">
          {isSubmitting ? "Sending..." : "Send Inquiry"}
        </Button>

        {submitError && (
          <p className="text-sm text-rosewood">{submitError}</p>
        )}
      </motion.form>
    </AnimatePresence>
  );
}
