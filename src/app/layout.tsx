import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://resumelabs.deenlabs.tech"),
  title: {
    default: "ResumeLabs — Free AI ATS Resume Builder & LaTeX Optimizer",
    template: "%s | ResumeLabs",
  },
  description:
    "Transform rough notes, old resumes, or LinkedIn profiles into recruiter-tested 1-page ATS resumes. Free instant ATS score analysis, LaTeX PDF export, and AI bullet rewriter powered by Google Gemini.",
  keywords: [
    "free ATS resume builder",
    "AI resume optimizer",
    "ATS resume checker",
    "Jake's LaTeX resume template",
    "software engineer resume builder",
    "DevOps resume template",
    "free AI resume generator 2026",
    "job description keyword matcher",
    "ResumeLabs",
    "Deen Labs",
  ],
  authors: [{ name: "Deen Labs", url: "https://deenlabs.tech" }],
  creator: "Deen Labs",
  publisher: "Deen Labs",
  alternates: {
    canonical: "https://resumelabs.deenlabs.tech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "ResumeLabs — Free AI ATS Resume Builder & LaTeX Optimizer",
    description:
      "Convert any rough text, LinkedIn profile, or draft into a recruiter-ready 1-page ATS resume in seconds. Free ATS scoring & PDF export.",
    url: "https://resumelabs.deenlabs.tech",
    siteName: "ResumeLabs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeLabs — Free AI ATS Resume Builder & LaTeX Optimizer",
    description:
      "Convert any rough text into a recruiter-ready ATS resume in seconds with AI. Free instant PDF export.",
    creator: "@deenlabs",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ResumeLabs",
  url: "https://resumelabs.deenlabs.tech",
  description:
    "AI-powered ATS Resume Builder and LaTeX Optimizer that restructures raw candidate notes into recruiter-ready single-page PDF resumes.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Deen Labs",
    url: "https://deenlabs.tech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link
          suppressHydrationWarning
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0a0f]">
        {children}
      </body>
    </html>
  );
}
