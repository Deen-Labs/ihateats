import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 1. File size cap before memory allocation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 413 }
      );
    }

    // 2. MIME / extension validation
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf";
    if (!hasPdfExtension && !isPdfMime) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are supported." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Magic bytes validation (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json(
        { error: "Invalid PDF file format." },
        { status: 400 }
      );
    }

    const pdfData = await pdfParse(buffer);
    const text = pdfData.text?.trim();

    if (!text || text.length < 5) {
      return NextResponse.json(
        {
          error:
            "The uploaded PDF appears to be empty or contains no readable text. Please upload a PDF with text content or paste your details manually.",
        },
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
