"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onLoadSample: () => void;
  targetPages: number;
  onTargetPagesChange: (pages: number) => void;
}

export default function ResumeInput({ value, onChange, onGenerate, isLoading, onLoadSample, targetPages, onTargetPagesChange }: ResumeInputProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<{ pages: number; wordCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRawPreview, setShowRawPreview] = useState(false);
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
      {/* Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-[#0a0a0f] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-file-arrow-up text-sm" />
            <span>Upload Resume PDF / File</span>
          </button>

          <button
            onClick={() => setActiveTab("text")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "text"
                ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-pen-to-square text-sm" />
            <span>Type / Paste Text Notes</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <i className="fa-solid fa-shield-halved text-[#06b6d4]" />
          100% Private · Zero Storage · In-Memory AI Processing
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Content Area */}
      {activeTab === "upload" ? (
        <div className="flex flex-col gap-4">
          {!fileName ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer w-full h-64 md:h-72 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center shadow-2xl ${
                isDragging
                  ? "border-[#06b6d4] bg-[#06b6d4]/10 scale-[1.01]"
                  : "border-white/15 bg-[#12121a]/80 hover:border-[#06b6d4]/50 hover:bg-[#12121a]"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06b6d4]/20 to-[#7c3aed]/20 border border-[#06b6d4]/30 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${isUploading ? "fa-spinner animate-spin" : "fa-cloud-arrow-up"} text-2xl text-[#38bdf8]`} />
              </div>

              <h3 className="text-white text-lg font-bold mb-1">
                {isUploading ? "Reading & Extracting Document..." : "Drag & Drop your Resume PDF here"}
              </h3>
              <p className="text-slate-400 text-sm mb-4 max-w-md">
                Supports PDF resumes, LinkedIn exported PDFs, or TXT files.
              </p>

              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-folder-open text-xs" />
                Browse File
              </button>
            </div>
          ) : (
            <div className="w-full bg-[#12121a]/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <i className="fa-solid fa-file-pdf text-xl text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      {fileName}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Parsed Ready
                      </span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {extractedInfo?.pages} Page(s) · {extractedInfo?.wordCount} Words extracted
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFileName(null);
                    setExtractedInfo(null);
                    onChange("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-rotate-left" />
                  <span>Choose Different File</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRawPreview(!showRawPreview)}
                  className="text-xs text-[#38bdf8] font-semibold hover:underline flex items-center gap-1.5"
                >
                  <i className={`fa-solid ${showRawPreview ? "fa-chevron-up" : "fa-chevron-down"}`} />
                  <span>{showRawPreview ? "Hide Extracted Text" : "View Extracted Text Preview"}</span>
                </button>
                <span className="text-xs text-slate-500">Gemini will optimize bullet points & verbs automatically</span>
              </div>

              {showRawPreview && (
                <div className="p-4 rounded-xl bg-[#0a0a0f] border border-white/10 max-h-48 overflow-y-auto custom-scrollbar text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {value}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type or paste your background, rough bullets, career history, or old draft text here..."
            className="w-full h-64 md:h-72 bg-[#12121a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none transition-all duration-300 shadow-2xl"
            spellCheck={false}
          />
        </div>
      )}

      {/* Format Badges & Target Length Controller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121a]/60 border border-white/10 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between">
          <h3 className="text-[#38bdf8] text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-sliders text-xs" />
            Target Resume Length
          </h3>
          <div className="flex bg-[#0a0a0f] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onTargetPagesChange(1)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                targetPages === 1
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-file text-xs" />
              <span>Strict 1 Page (Top Projects)</span>
            </button>
            <button
              onClick={() => onTargetPagesChange(2)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                targetPages === 2
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-file-lines text-xs" />
              <span>2 Pages (Executive)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {targetPages === 1
              ? "🎯 AI will weight & select your top 3 highest-impact projects to guarantee a clean 1-page fit."
              : "📑 Includes up to 5-6 projects with expanded architecture details across 2 pages."}
          </p>
        </div>

        <div className="bg-[#12121a]/60 border border-white/10 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between">
          <h3 className="text-[#38bdf8] text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-check-double text-xs" />
            Supported Inputs
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              "PDF Resume Document",
              "LinkedIn Profile PDF",
              "TXT File",
              "Rough Bullets",
              "Career Summary"
            ].map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={onLoadSample}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <i className="fa-solid fa-flask text-slate-400" />
          <span>Load sample draft</span>
        </button>
        <button
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          className="w-full flex-1 relative group px-6 py-4 rounded-xl bg-gradient-to-r from-[#06b6d4] via-[#7c3aed] to-[#a78bfa] text-white font-bold text-lg shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analysing & Optimising Resume...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles text-cyan-300" />
                Generate ATS Resume
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
