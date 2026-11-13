import { generateResume } from "@/lib/gemini";
import { verifyProToken } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";

const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_FREE_PER_DAY = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, jobDescription, targetPages = 1 } = body;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json(
        { error: "rawText is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Input length caps to protect server resources
    if (
      rawText.length > 25000 ||
      (typeof jobDescription === "string" && jobDescription.length > 10000)
    ) {
      return NextResponse.json(
        { error: "Input text exceeds maximum allowed length." },
        { status: 413 }
      );
    }

    // Read and verify Pro cookie
    const proCookie = request.cookies.get("ihateats_pro_token")?.value;
    const { valid: isPro } = verifyProToken(proCookie);

    // Rate-limiting for free users in production
    if (!isPro && process.env.NODE_ENV === "production") {
      const forwarded = request.headers.get("x-forwarded-for");
      const clientIp = forwarded
        ? forwarded.split(",")[0].trim()
        : request.headers.get("x-real-ip") || "unknown-ip";

      const now = Date.now();
      const record = ipRateLimitMap.get(clientIp);

      if (!record || now > record.resetAt) {
        ipRateLimitMap.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        if (record.count >= MAX_FREE_PER_DAY) {
          return NextResponse.json(
            { error: "Daily free quota reached. Please upgrade to Pro for unlimited generations." },
            { status: 429 }
          );
        }
        record.count += 1;
      }
    }

    const resumeData = await generateResume(rawText, jobDescription, Number(targetPages) || 1);

    return NextResponse.json(resumeData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error.";
    console.error("API /generate error:", message);

    if (
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini API free-tier rate limit reached. Spikes in demand are temporary — please wait 15-30 seconds and click Generate ATS Resume again!",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
