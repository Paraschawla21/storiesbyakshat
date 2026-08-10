"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-2 font-display text-3xl text-ink">Admin Sign In</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Restricted access for Stories By Akshat.
      </p>

      <form action={formAction} className="flex flex-col gap-5">
        <Input id="email" name="email" type="email" label="Email" required autoFocus />
        <Input id="password" name="password" type="password" label="Password" required />

        {state?.error && (
          <p className="text-sm text-rosewood">{state.error}</p>
        )}

        <Button type="submit" variant="primary" disabled={isPending} className="mt-2">
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Link
        href="/admin/forgot-password"
        className="mt-6 text-sm font-medium text-ink-soft hover:text-marigold-dark"
      >
        Forgot password?
      </Link>
    </div>
  );
}
