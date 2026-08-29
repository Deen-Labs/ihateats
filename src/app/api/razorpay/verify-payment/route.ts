import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Sandbox bypass if keys not configured
    if (!keySecret || razorpay_order_id?.startsWith("order_sandbox_")) {
      return NextResponse.json({ success: true, verified: true, planId });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    if (isVerified) {
      return NextResponse.json({ success: true, verified: true, planId });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid Razorpay payment signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
