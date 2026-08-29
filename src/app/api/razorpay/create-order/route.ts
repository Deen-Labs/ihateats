import { NextResponse } from "next/server";
import Razorpay from "razorpay";

function cleanKey(val?: string): string {
  if (!val) return "";
  return val.replace(/^[^=]+=\s*/, "").replace(/^["']|["']$/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const { planId, amount } = await req.json();

    const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    const keyId = cleanKey(rawKeyId);
    const keySecret = cleanKey(rawKeySecret);

    if (!keyId || !keySecret) {
      // Return sandbox order ID for immediate testing if Razorpay keys aren't added yet
      return NextResponse.json({
        id: `order_sandbox_${Date.now()}`,
        currency: "INR",
        amount: (amount || 199) * 100,
        status: "created",
        isSandbox: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${planId}_${Date.now()}`,
      notes: { planId },
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
