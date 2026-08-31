"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  jobDescription?: string;
  onJobDescriptionChange?: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onLoadSample: () => void;
  targetPages: number;
  onTargetPagesChange: (pages: number) => void;
}

const SAMPLE_JOB_PRESETS = [
  {
    title: "🛠️ AWS Senior DevOps Architect",
    jd: "Senior Multi-Cloud & DevOps Architect. Requirements: AWS (EC2, EKS, S3, IAM), Kubernetes, Terraform, Infrastructure as Code, CI/CD automation pipelines, Docker, Prometheus monitoring, zero-downtime microservices deployments, 99.99% SLA uptime management.",
  },
  {
    title: "💻 Google Senior Full Stack Engineer",
    jd: "Senior Full Stack Engineer. Requirements: React, Next.js, TypeScript, Node.js, Distributed Systems, Redis caching, GraphQL & REST APIs, microservices architecture, automated unit/integration testing, cloud-native high-throughput engineering.",
  },
  {
    title: "🚀 Stripe Technical Product Manager",
    jd: "Technical Product Manager. Requirements: Distributed API design, payment infrastructure, developer platform ecosystem, cross-functional engineering roadmap alignment, data-driven feature analytics, technical specification drafting.",
  },
];

export default function ResumeInput({
  value,
  onChange,
  jobDescription = "",
  onJobDescriptionChange,
  onGenerate,
  isLoading,
  onLoadSample,
  targetPages,
  onTargetPagesChange,
}: ResumeInputProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [mode, setMode] = useState<"general" | "targeted">("general");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<{ pages: number; wordCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);
    setExtractedInfo(null);

    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        onChange(text);
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setExtractedInfo({ pages: 1, wordCount: words });
      } else {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to parse PDF file.");
        }

        const data = await res.json();
        if (data.text) {
          onChange(data.text);
          const words = data.text.trim().split(/\s+/).filter(Boolean).length;
          setExtractedInfo({ pages: data.pages || 1, wordCount: words });
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "PDF upload failed.");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Primary Workflow Switcher: General ATS vs Targeted Job Matcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-[#0a0a0f] rounded-2xl border border-white/10 shadow-lg">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 flex-1">
          <button
            onClick={() => setMode("general")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === "general"
                ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-bolt text-xs" />
            <span>⚡ General ATS Builder</span>
          </button>

          <button
            onClick={() => setMode("targeted")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === "targeted"
                ? "bg-gradient-to-r from-emerald-500 via-[#06b6d4] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-bullseye text-xs text-emerald-300" />
            <span>🎯 Target Job Matcher (1-Click Customizer)</span>
          </button>
        </div>

        {/* Target Page Target Switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-xl border border-white/5 justify-center">
          <span className="text-xs text-slate-400 font-semibold">Format:</span>
          <button
            onClick={() => onTargetPagesChange(1)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              targetPages === 1
                ? "bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[#38bdf8]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1-Page Target
          </button>
          <button
            onClick={() => onTargetPagesChange(2)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              targetPages === 2
                ? "bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#a78bfa]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2-Page Detailed
          </button>
        </div>
      </div>

      {/* Mode Sub-Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-[#0a0a0f] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-white/10 text-white border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-file-arrow-up text-xs" />
            <span>Upload Resume File / PDF</span>
          </button>

          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-white/10 text-white border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-pen-to-square text-xs" />
            <span>Type / Paste Notes</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <i className="fa-solid fa-shield-halved text-[#06b6d4]" />
          100% Private · In-Memory AI Processing
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Content Area: General vs Targeted layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Candidate Background Input Column */}
        <div className={mode === "targeted" ? "md:col-span-6 flex flex-col gap-4" : "md:col-span-12 flex flex-col gap-4"}>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-user-gear text-[#06b6d4]" />
              1. Candidate Background / Old Resume
            </label>
            {value && (
              <span className="text-[11px] text-slate-400 font-medium">
                {value.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>

          {activeTab === "upload" && !fileName ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer w-full h-56 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center shadow-xl ${
                isDragging
                  ? "border-[#06b6d4] bg-[#06b6d4]/10 scale-[1.01]"
                  : "border-white/15 bg-[#12121a]/80 hover:border-[#06b6d4]/50 hover:bg-[#12121a]"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#7c3aed]/20 border border-[#06b6d4]/30 flex items-center justify-center mb-3 shadow-md">
                <i className={`fa-solid ${isUploading ? "fa-spinner animate-spin" : "fa-cloud-arrow-up"} text-xl text-[#38bdf8]`} />
              </div>
              <h4 className="text-white text-sm font-bold mb-1">
                {isUploading ? "Reading Document..." : "Drag & Drop Resume PDF"}
              </h4>
              <p className="text-slate-400 text-xs mb-3">PDF or TXT files</p>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white text-xs font-bold shadow-md"
              >
                Browse File
              </button>
            </div>
          ) : activeTab === "upload" && fileName ? (
            <div className="w-full bg-[#12121a]/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-pdf text-xl text-emerald-400" />
                  <div>
                    <h5 className="text-white font-bold text-xs">{fileName}</h5>
                    <p className="text-slate-400 text-[11px]">{extractedInfo?.wordCount} Words parsed</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFileName(null);
                    setExtractedInfo(null);
                    onChange("");
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Clear File
                </button>
              </div>
            </div>
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Describe your candidate background, paste your old resume draft, or write rough bullet points..."
              rows={8}
              className="w-full p-4 rounded-2xl bg-[#0a0a0f] text-sm text-slate-200 border border-white/10 placeholder:text-slate-600 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all resize-y custom-scrollbar"
            />
          )}
        </div>

        {/* Target Job Description Column (Visible in Targeted mode) */}
        {mode === "targeted" && (
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-bullseye text-emerald-400" />
                2. Target Job Description
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">1-Click Match</span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange && onJobDescriptionChange(e.target.value)}
              placeholder="Paste the target job description (responsibilities, required skills, key terms)..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-[#0a0a0f] text-sm text-slate-200 border border-emerald-500/30 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all resize-y custom-scrollbar"
            />

            {/* 1-Click Sample Preset Buttons */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Or load a 1-click sample job description:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_JOB_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onJobDescriptionChange && onJobDescriptionChange(preset.jd)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-all text-left"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onLoadSample}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-[#06b6d4] fa-bolt text-cyan-400" />
          <span>⚡ Load Technical Sample Demo</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-[#06b6d4] to-[#7c3aed] text-white font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{mode === "targeted" ? "Aligning Resume to Job Description..." : "Optimising ATS Resume..."}</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-[#06b6d4] fa-wand-magic-sparkles" />
              <span>{mode === "targeted" ? "🎯 Generate Job-Targeted Resume" : "⚡ Generate ATS Resume"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
