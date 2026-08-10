"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setInfo(data.message || "If an account exists for that email, a code has been sent.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code.");

      setResetToken(data.resetToken);
      setInfo(null);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset password.");

      setStep("done");
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-2 font-display text-3xl text-ink">Reset Password</h1>
      <p className="mb-8 text-sm text-ink-soft">
        {step === "email" && "Enter your admin email to receive a verification code."}
        {step === "otp" && "Enter the 6-digit code sent to your email."}
        {step === "reset" && "Choose a new password."}
        {step === "done" && "Your password has been reset."}
      </p>

      {step === "email" && (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
          <Input
            id="email"
            type="email"
            label="Email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm text-rosewood">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Sending..." : "Send Code"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
          {info && <p className="text-sm text-ink-soft">{info}</p>}
          <Input
            id="otp"
            label="6-digit code"
            required
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="text-sm text-rosewood">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError(null);
            }}
            className="text-sm font-medium text-marigold-dark hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
          <Input
            id="newPassword"
            type="password"
            label="New Password"
            required
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rosewood">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Reset Password"}
          </Button>
        </form>
      )}

      {step === "done" && (
        <p className="text-sm text-ink-soft">
          Redirecting you to sign in...
        </p>
      )}

      <Link
        href="/admin/login"
        className="mt-8 text-sm font-medium text-ink-soft hover:text-marigold-dark"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
