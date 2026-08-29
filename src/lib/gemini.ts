import { GoogleGenAI } from "@google/genai";
import { ResumeSchema, type ResumeData } from "./schema";

const SYSTEM_PROMPT = `You are a senior technical recruiter and professional resume strategist with 15+ years of
experience placing engineers, DevOps specialists, developers, and analysts at top global tech companies.

Your task is to convert the candidate's provided raw text or resume into a polished, ATS-optimised resume.

CRITICAL FACTUAL INTEGRITY RULES (STRICT NO-HALLUCINATION):
1. Extract candidate facts ONLY from the provided input text.
2. NEVER invent company names, job titles, universities, degrees, graduation years, or certifications.
3. Preserve the candidate's exact contact details (Email, Phone number with country code like +91, Location, LinkedIn, GitHub).
4. Do NOT invent years of experience (e.g. do not say "6+ years" unless stated in input).
5. If a section (like Certifications, Projects, or Education) is not mentioned in the input, return an empty array [].
6. NEVER copy placeholder text from example schemas.

CRITICAL ATS SCORING & QUALITY TARGET (MINIMUM 90+ ATS SCORE):
Your primary objective is to rewrite the candidate's resume so that the resulting ATS score ('ats_score_after') achieves AT LEAST 90 / 100 on every generation!

ATS SCORING FORMULA (100 POINTS TOTAL):
1. Action Verb Power (25 pts): 100% of bullet points must begin with strong action verbs (Architected, Spearheaded, Engineered, Automated, Deployed, Scaled, Optimised).
2. Quantified Impact (25 pts): Achievements must include numerical metrics (~%, DAU, latency, transactions, uptime, scale).
3. ATS Structural Hygiene (20 pts): Standard section headers, clean contact info (Email, Phone with country code, Location, LinkedIn/GitHub), single-column flow.
4. Categorized Skills Density (15 pts): Technical skills must be grouped into 3-4 distinct categories (e.g. Cloud & DevOps, Infrastructure & OS, Programming).
5. Professional Summary & Readability (15 pts): 2-3 sentence impactful summary, zero filler phrases or spelling errors.

- Calculate 'ats_score_before' based on the raw input text's original quality (typically 30-65).
- Calculate 'ats_score_after' based on your optimized rewrite (MUST be between 90 and 98).

IMPORTANT: Return ONLY valid JSON matching the schema format below.`;

function buildPrompt(rawText: string, jobDescription?: string, targetPages: number = 1): string {
  let prompt = `CANDIDATE INPUT TEXT:\n${rawText}`;
  if (jobDescription?.trim()) {
    prompt += `\n\n---\nTARGET JOB DESCRIPTION (tailor keywords to match):\n${jobDescription}`;
  }

  if (targetPages === 1) {
    prompt += `\n\n---\nSTRICT 1-PAGE TARGET & PROJECT WEIGHTING RULES:
- Target Length: STRICT 1-PAGE FORMAT (~300-350 words max).
- PROJECT PRIORITIZATION & WEIGHTING: Select and include ONLY the top 3 highest-impact projects. Omit minor side projects so Education and Certifications fit cleanly on 1 single page!
- EXPERIENCE BULLETS: Limit to 2 high-impact bullet points per role (1 line each).
- SKILLS: Limit each category to top 5-7 core key terms (e.g. "AWS, Azure, Docker, Kubernetes, Terraform, CI/CD") so each category line fits cleanly on 1-2 lines max.
- SUMMARY: 2 concise sentences max.`;
  } else {
    prompt += `\n\n---\nDETAILED 2-PAGE TARGET RULES:
- Include up to 5-6 projects with detailed architecture descriptions and full experience bullet lists.`;
  }

  return prompt;
}

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash"
];

const JSON_TEMPLATE = `{
  "name": "<Full Name from input>",
  "email": "<Email address from input>",
  "phone": "<Phone number with exact country code from input>",
  "linkedin": "<LinkedIn URL from input>",
  "github": "<GitHub URL from input>",
  "location": "<City, State, Country from input>",
  "summary": "<2-3 sentence summary based strictly on candidate input>",
  "skills": [
    { "category": "<Category Name>", "items": ["<Skill 1>", "<Skill 2>"] }
  ],
  "experience": [
    {
      "title": "<Exact Job Title>",
      "company": "<Exact Company Name>",
      "location": "<Exact Location>",
      "start_date": "<Start Date>",
      "end_date": "<End Date or Present>",
      "bullets": [
        "<Action verb bullet point based on candidate achievements>"
      ]
    }
  ],
  "education": [
    {
      "degree": "<Degree Name>",
      "institution": "<School / University Name>",
      "location": "<Location>",
      "graduation": "<Year>",
      "notes": "<GPA or notes if provided>"
    }
  ],
  "certifications": [
    { "name": "<Certification Name>", "issuer": "<Issuing Org>", "year": "<Year>" }
  ],
  "projects": [
    {
      "name": "<Project Name>",
      "description": "<One line summary>",
      "tech": ["<Tech 1>", "<Tech 2>"],
      "url": "<URL if provided>"
    }
  ],
  "analysis": {
    "ats_score_before": 55,
    "ats_score_after": 92,
    "weak_phrases_upgraded": 4,
    "achievements_quantified": 3,
    "action_verbs_count": 10,
    "key_improvements": ["Upgraded weak verbs", "Formatted ATS structure"],
    "missing_info": ["Consider adding portfolio link"]
  }
}`;

export async function generateResume(
  rawText: string,
  jobDescription?: string,
  targetPages: number = 1
): Promise<ResumeData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(rawText, jobDescription, targetPages);

  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt + "\n\nCRITICAL REQUIREMENT: Output MUST be raw valid JSON matching this exact structure template (DO NOT return empty fields if data can be inferred from input):\n" + JSON_TEMPLATE,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        });

        const text = response.text?.trim() || "";
        if (!text) throw new Error("Empty response from Gemini API.");

        const cleanText = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleanText);
        return parsed as ResumeData;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`${modelName} attempt ${attempt + 1} failed: ${lastError.message}`);
        // If rate limited or service unavailable, pause before retry
        const backoffMs = (attempt + 1) * 2000;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}
