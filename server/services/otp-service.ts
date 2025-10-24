import crypto from 'crypto';

// In-memory OTP storage (in production, use Redis or a database)
const otpStore: Map<string, { otp: string; expiresAt: Date; attempts: number }> = new Map();

// Generate a 6-digit OTP
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP with expiration time (5 minutes)
export function storeOTP(email: string, otp: string): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  
  // Remove any existing OTP for this email
  otpStore.delete(email);
  
  otpStore.set(email, { otp, expiresAt, attempts: 0 });
  console.log(`OTP stored for ${email}: ${otp}, expires at ${expiresAt}`);
}

// Verify OTP
export function verifyOTP(email: string, otp: string): { success: boolean; error?: string } {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { success: false, error: 'OTP not found or expired' };
  }
  
  const { otp: storedOTP, expiresAt, attempts } = storedData;
  
  // Check if OTP has expired
  if (new Date() > expiresAt) {
    otpStore.delete(email);
    return { success: false, error: 'OTP has expired' };
  }
  
  // Check if too many attempts
  if (attempts >= 3) {
    otpStore.delete(email);
    return { success: false, error: 'Too many attempts. Please request a new OTP.' };
  }
  
  // Increment attempts
  storedData.attempts++;
  
  // Check if OTP matches
  if (storedOTP === otp) {
    otpStore.delete(email); // Remove OTP after successful verification
    return { success: true };
  }
  
  return { success: false, error: 'Invalid OTP' };
}

// Clean up expired OTPs
export function cleanupExpiredOTPs(): void {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
      cleanedCount++;
    }
  }
  
  console.log(`Cleaned up ${cleanedCount} expired OTPs`);
}

// Get remaining time for OTP (in seconds)
export function getOTPRemainingTime(email: string): number {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return 0;
  }
  
  const now = new Date();
  const remainingTime = Math.floor((storedData.expiresAt.getTime() - now.getTime()) / 1000);
  
  return Math.max(0, remainingTime);
}