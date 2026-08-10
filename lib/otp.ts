import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateOtp(): string {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashResetToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyResetTokenHash(
  token: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_OTP_ATTEMPTS = 5;
