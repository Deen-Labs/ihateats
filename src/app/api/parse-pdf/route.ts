import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const pdfData = await pdfParse(buffer);
    const text = pdfData.text?.trim();

    if (!text || text.length < 5) {
      return NextResponse.json(
        { error: "The uploaded PDF appears to be empty or contains no readable text. Please upload a PDF with text content or paste your details manually." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, pages: pdfData.numpages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error parsing PDF file.";
    console.error("API /parse-pdf error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
