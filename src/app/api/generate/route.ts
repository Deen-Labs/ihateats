import { generateResume } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

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

    const resumeData = await generateResume(rawText, jobDescription, Number(targetPages) || 1);

    return NextResponse.json(resumeData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error.";
    console.error("API /generate error:", message);

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
      return NextResponse.json(
        { error: "Gemini API free-tier rate limit reached. Spikes in demand are temporary — please wait 15-30 seconds and click Generate ATS Resume again!" },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
