import crypto from "crypto";

export interface PlanDetails {
  priceInr: number;
  name: string;
  daysValid: number;
}

export const PLAN_PRICES: Record<string, PlanDetails> = {
  weekly: {
    priceInr: 199,
    name: "Weekly Job Hunt Pass",
    daysValid: 7,
  },
  monthly: {
    priceInr: 399,
    name: "Monthly Pro",
    daysValid: 30,
  },
  lifetime: {
    priceInr: 999,
    name: "Lifetime Pass",
    daysValid: 3650,
  },
};

function getSecret(): string {
  return (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.GEMINI_API_KEY ||
    "local-dev-secret"
  );
}

export function signProToken(planId: string, expiresAt: number): string {
  const secret = getSecret();
  const payload = `${planId}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

export function verifyProToken(
  token: string | undefined | null
): { valid: boolean; planId?: string; expiresAt?: number } {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(":");
  if (parts.length !== 3) {
    return { valid: false };
  }

  const [planId, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    return { valid: false };
  }

  const secret = getSecret();
  const payload = `${planId}:${expiresAt}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  const sigBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== sigBuf.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return { valid: false };
  }

  return {
    valid: true,
    planId,
    expiresAt,
  };
}
