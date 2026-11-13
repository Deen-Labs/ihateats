# ResumeLabs (ihateATS)

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-8E75C4?style=for-the-badge&logo=google)
![LaTeX](https://img.shields.io/badge/LaTeX-Export-008080?style=for-the-badge&logo=latex&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-02042B?style=for-the-badge&logo=razorpay&logoColor=white)

**ResumeLabs** (ihateATS) is an AI-powered, production-grade ATS resume builder and job description keyword matcher. It converts rough notes, LinkedIn summaries, or uploaded resumes into high-impact, recruiter-tested resumes optimized for Applicant Tracking Systems (ATS).

Engineered with strict zero-hallucination guardrails, native Zod v4 structured schema outputs, dual-format export (PDF + Jake's LaTeX `.tex`), and in-editor AI bullet rewriting using Google's XYZ formula.

---

## ✨ Features & Architecture

### 1. AI Generation & Optimization
- **Native Zod v4 Structured Outputs**: Gemini API calls are strictly bound to `ResumeSchema` via `z.toJSONSchema()` with server-side validation.
- **Failover Model Pipeline**: Dynamic model rotation (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`) with fast-fail retry logic on `404`/`NOT_FOUND` endpoints.
- **Target Job Matcher**: Tailors candidate bullets to target job descriptions, computing keyword alignment and highlighting matched vs. recommended missing skills.
- **Single-Bullet AI Rewriter**: Dedicated endpoint (`/api/rewrite-bullet`) rewriting individual experience bullets using Google's XYZ formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*).

### 2. Editor & Live Preview (UI/UX)
- **Live Scaled Canvas**: Responsive auto-fit preview with zoom controls (30%–140%), paper format switching (A4 Global vs. US Letter), and density toggles (Strict 1-Page at 9.2pt vs. Standard at 11pt).
- **Non-Printing Page 1 Cutoff Line**: Real-time visual indicator warning when content exceeds a single page.
- **Persistent Local Storage Auto-Save**: In-progress manual edits automatically persist to `localStorage` (`ihateats_active_draft`) and sync with session history.
- **Extracted PDF Text Inspector**: View and edit parsed PDF text in a collapsible textarea before generating.
- **Interactive Multi-Section Form**: Section-linked focus rings, move up/down array sorting, and in-place bullet actions.

### 3. Dual-Format Export
- **1-Click PDF Export**: Uses an isolated body-level print container that preserves exact density, font sizes, line heights, and margins (`@media print`) without external PDF rendering engines.
- **Raw LaTeX (`.tex`) Export**: Generates clean, compilable LaTeX code based on the single-column Jake's Resume template (`\documentclass[letterpaper,11pt]{article}`) with automatic character and URL escaping (`escapeLatex`, `escapeLatexUrl`).

### 4. Enterprise Security Hardening
- **Server-Side Pricing**: Defined in `PLAN_PRICES` constant (`src/lib/plans.ts`); client cannot tamper with order amounts.
- **Cryptographic Pro Tokens**: Verification tokens signed via HMAC-SHA256 and verified using `crypto.timingSafeEqual` in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Sandbox Forgery Prevention**: Sandbox mock orders strictly disallowed in production environments.
- **In-Memory IP Rate Limiting**: Enforces daily caps on free-tier generation (3/day) and single-bullet rewrites (15/day).
- **Hardened PDF Parsing**: Memory exhaustion protection via 5MB file size caps and `%PDF-` magic header validation.
- **XSS Sanitization**: Strips `javascript:` URIs from all rendered web links.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) |
| **AI Model API** | [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API) |
| **Validation** | [Zod v4](https://zod.dev/) (`z.toJSONSchema`) |
| **PDF Parsing** | [pdf-parse](https://www.npmjs.com/package/pdf-parse) |
| **Payments** | [Razorpay SDK](https://razorpay.com/docs/) |
| **Icons** | [Lucide React](https://lucide.dev/) & [Font Awesome](https://fontawesome.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- Razorpay Test/Live Keys (optional for local sandbox)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Deen-Labs/ResumeLabs.git
   cd ResumeLabs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Google Gemini API Keys (Supports key rotation)
   GEMINI_API_KEY=your_primary_gemini_api_key
   GEMINI_API_KEY_1=your_backup_gemini_key_1
   GEMINI_API_KEY_2=your_backup_gemini_key_2

   # Razorpay Configuration (Optional for dev/test sandbox)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing & Verification

- **Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Lint Check**:
  ```bash
  npm run lint
  ```
- **Regression Test Suite**:
  Run while the development server is active:
  ```bash
  npm run test:regression
  ```
  Validates 4 comprehensive end-to-end scenarios:
  1. Strict 1-Page Project Weighting & Truncation
  2. Conversational Raw Text Extraction & Phone Country Code Preservation
  3. Target Job Description Keyword Tailoring
  4. Executive 2-Page Mode Expansion

---

## 🕹️ Developer Mode & Shortcuts

- **Toggle Developer Mode (Unlimited Generations)**:
  - **Keyboard Shortcut**: `Ctrl + Shift + D` (or `Cmd + Shift + D` on macOS).
  - **Logo Easter Egg**: Click the top-left logo **5 times rapidly**.
- **Dev Sandbox Payment**: In non-production environments when Razorpay keys are omitted, mock orders (`order_sandbox_*`) allow immediate simulated Pro activation.

---

## 📄 License

Engineered and maintained by [Deen Labs](https://github.com/Deen-Labs). All rights reserved.
