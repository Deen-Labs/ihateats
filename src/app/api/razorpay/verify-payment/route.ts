import { NextResponse } from "next/server";
import crypto from "crypto";
import { PLAN_PRICES, signProToken } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    const isProduction = process.env.NODE_ENV === "production";
    const isSandboxOrder = typeof razorpay_order_id === "string" && razorpay_order_id.startsWith("order_sandbox_");

    // Block sandbox order IDs in production
    if (isProduction && isSandboxOrder) {
      return NextResponse.json(
        { success: false, error: "Sandbox orders are forbidden in production." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const daysValid = (planId && PLAN_PRICES[planId]?.daysValid) || 30;
    const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;

    // Sandbox bypass if keys not configured (only permitted in non-production)
    if (!isProduction && (!keySecret || isSandboxOrder)) {
      const token = signProToken(planId || "weekly", expiresAt);
      const res = NextResponse.json({ success: true, verified: true, planId });
      res.cookies.set("ihateats_pro_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: daysValid * 24 * 60 * 60,
      });
      return res;
    }

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret key not configured." },
        { status: 500 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const sigBuf = Buffer.from(String(razorpay_signature || ""), "utf8");

    const isVerified =
      expectedBuf.length === sigBuf.length &&
      crypto.timingSafeEqual(expectedBuf, sigBuf);

    if (isVerified) {
      const token = signProToken(planId || "weekly", expiresAt);
      const res = NextResponse.json({ success: true, verified: true, planId });
      res.cookies.set("ihateats_pro_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/",
        maxAge: daysValid * 24 * 60 * 60,
      });
      return res;
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
