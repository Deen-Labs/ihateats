import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PLAN_PRICES } from "@/lib/plans";

function cleanKey(val?: string): string {
  if (!val) return "";
  return val.replace(/^[^=]+=\s*/, "").replace(/^["']|["']$/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planId } = body;

    if (!planId || typeof planId !== "string" || !PLAN_PRICES[planId]) {
      return NextResponse.json(
        { error: "Invalid or missing planId." },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[planId];
    const amountInPaise = plan.priceInr * 100;

    const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    const keyId = cleanKey(rawKeyId);
    const keySecret = cleanKey(rawKeySecret);

    if (!keyId || !keySecret) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Razorpay payment keys are not configured on the server." },
          { status: 500 }
        );
      }

      // Sandbox order fallback ONLY in development / test environments when keys are missing
      return NextResponse.json({
        id: `order_sandbox_${Date.now()}`,
        currency: "INR",
        amount: amountInPaise,
        status: "created",
        isSandbox: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${planId}_${Date.now()}`,
      notes: { planId, planName: plan.name },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
