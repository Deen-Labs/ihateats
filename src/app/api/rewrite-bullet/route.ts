import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getApiKey } from "@/lib/gemini";
import { verifyProToken } from "@/lib/plans";

const bulletRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_FREE_BULLETS_PER_DAY = 15;
const WINDOW_MS = 24 * 60 * 60 * 1000;

const SYSTEM_INSTRUCTION = `You are an elite technical resume writer and ATS specialist.
Your task is to rewrite a single resume bullet point using Google's XYZ formula:
"Accomplished [X] as measured by [Y], by doing [Z]".

CRITICAL RULES:
1. Start with a powerful, decisive action verb in the past tense (e.g., Architected, Engineered, Spearheaded, Automated, Optimized, Scaled, Deployed).
2. Incorporate realistic quantified impact (percentages, time/cost savings, latency drops, user count, throughput, or reliability uptime).
3. Keep the rewritten bullet concise, impactful, and professional (1 to 2 sentences max).
4. Do NOT hallucinate false companies or degrees; focus on strengthening the technical achievement.
5. Return ONLY a valid JSON object matching: {"rewritten": "..."}`;

const RewriteSchema = z.object({
  rewritten: z.string().describe("The rewritten bullet point using Google XYZ formula."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bullet, roleTitle, company } = body;

    if (!bullet || typeof bullet !== "string" || !bullet.trim()) {
      return NextResponse.json(
        { error: "A non-empty bullet point string is required." },
        { status: 400 }
      );
    }

    if (bullet.length > 1000) {
      return NextResponse.json(
        { error: "Bullet text exceeds maximum allowed length of 1,000 characters." },
        { status: 413 }
      );
    }

    // Pro token check & rate limiting
    const proCookie = request.cookies.get("ihateats_pro_token")?.value;
    const { valid: isPro } = verifyProToken(proCookie);

    if (!isPro && process.env.NODE_ENV === "production") {
      const forwarded = request.headers.get("x-forwarded-for");
      const clientIp = forwarded
        ? forwarded.split(",")[0].trim()
        : request.headers.get("x-real-ip") || "unknown-ip";

      const now = Date.now();
      const record = bulletRateLimitMap.get(clientIp);

      if (!record || now > record.resetAt) {
        bulletRateLimitMap.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        if (record.count >= MAX_FREE_BULLETS_PER_DAY) {
          return NextResponse.json(
            { error: "Daily free quota reached. Please upgrade to Pro for unlimited AI rewrites." },
            { status: 429 }
          );
        }
        record.count += 1;
      }
    }

    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    let userPrompt = `Bullet point to rewrite:\n"${bullet.trim()}"`;
    if (roleTitle && typeof roleTitle === "string") {
      userPrompt += `\nRole Title: ${roleTitle.trim()}`;
    }
    if (company && typeof company === "string") {
      userPrompt += `\nCompany: ${company.trim()}`;
    }

    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let responseText = "";
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.4,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(RewriteSchema),
          },
        });

        responseText = response.text?.trim() || "";
        if (responseText) {
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`rewrite-bullet ${model} attempt failed: ${lastError.message}`);
      }
    }

    if (!responseText) {
      throw lastError || new Error("No response returned from AI model.");
    }

    const cleanText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanText);
    const validated = RewriteSchema.parse(parsed);

    const rewritten = validated.rewritten.replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("API /rewrite-bullet error:", error);
    const message = error instanceof Error ? error.message : "Failed to rewrite bullet point.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
