# ihateATS

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React-PDF](https://img.shields.io/badge/React_PDF-FF4154?style=for-the-badge&logo=react&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)

ihateATS is an AI-powered, 100% free ATS resume builder. It takes your rough notes, old resumes, or LinkedIn profiles and transforms them into recruiter-tested, 1-page ATS-optimized resumes instantly. 

Powered by our proprietary **Lab Engine AI**, it ensures you never get auto-rejected by Applicant Tracking Systems again.

---

## Features

- **Target Job Matcher**: Paste a Job Description and the AI will analyze missing keywords, score your resume, and re-write your bullets to perfectly align with the specific role.
- **Instant PDF Parsing**: Upload an old PDF resume, and our extractor will pull your data instantly into the editor.
- **Live Preview Editor**: Drag-and-drop array reordering, direct text-box editing, and a side-by-side split screen showing exactly how the final PDF looks in real-time.
- **One-Click PDF Export**: Generates a mathematically perfect, Jake's Resume style PDF format using @react-pdf/renderer - no LaTeX installation required.
- **ATS Scoring Dashboard**: Visual gauges and donut charts analyzing your experience breakdown, word counts, and ATS compliance score.
- **Razorpay Freemium Quotas**: Built-in daily generation quotas with Razorpay integration for unlimited "Pro" access.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion (for fluid animations)
- **AI Engine**: Google Gemini API (White-labeled as *Lab Engine*)
- **Validation**: Zod (for strict JSON schema parsing)
- **PDF Generation**: @react-pdf/renderer
- **Monetization**: Razorpay API

---

## Local Development Setup

1. **Clone the repository:**
   `ash
   git clone https://github.com/Deen-Labs/ihateATS.git
   cd ihateATS-web
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Set up Environment Variables:**
   Create a .env.local file in the root directory and add the following:
   `env
   # AI Engine Keys (Supports multiple for rotation)
   GEMINI_API_KEY=your_gemini_key_here
   GEMINI_API_KEY_1=optional_backup_key_1
   GEMINI_API_KEY_2=optional_backup_key_2
   
   # Razorpay Keys
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   `

4. **Run the development server:**
   `ash
   npm run dev
   `

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Developer Mode (Unlimited Generations)

While testing locally or in production, you can bypass the Razorpay paywall and quota limits using **Developer Mode**:

- **Keyboard Shortcut**: Press Ctrl + Shift + D (or Cmd + Shift + D on Mac).
- **Easter Egg**: Click the "ihateATS" logo in the top-left navigation bar **5 times rapidly**.

This will unlock unlimited Lab Engine AI generations for your session.

---

## License

Designed and Engineered by [Deen Labs](https://github.com/Deen-Labs). All rights reserved.

