"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResumeData, HistoryEntry } from "@/lib/schema";
import Hero from "@/components/Hero";
import ResumeInput from "@/components/ResumeInput";
import JobMatcher from "@/components/JobMatcher";
import HistorySidebar from "@/components/HistorySidebar";
import ResumePreview from "@/components/ResumePreview";
import ResumeEditor from "@/components/ResumeEditor";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PDFExport from "@/components/PDFExport";
import QuotaBadge from "@/components/QuotaBadge";
import PaywallModal from "@/components/PaywallModal";
import { getQuotaState, consumeCredit, type QuotaState } from "@/lib/quota";

import { SAMPLE_TECHNICAL_RAW_TEXT, SAMPLE_TECHNICAL_RESUME_DATA } from "@/lib/sampleData";
import { smoothScrollTo } from "@/lib/smoothScroll";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("resumelabs_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("resumelabs_history", JSON.stringify(history));
  } catch {
    // localStorage full or unavailable
  }
}

export default function Home() {
  const [rawText, setRawText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("contact");
  const [targetPages, setTargetPages] = useState<number>(1);

  const [quota, setQuota] = useState<QuotaState>({ remaining: 2, limit: 2, isPro: false });
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  useEffect(() => {
    setHistory(loadHistory());
    setQuota(getQuotaState());
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  // Normalize AI response to fill missing fields with safe defaults
  function normalizeResumeData(raw: Record<string, unknown>): ResumeData {
    const d = raw as Partial<ResumeData>;
    return {
      name: d.name || "",
      email: d.email || "",
      phone: d.phone || "",
      linkedin: d.linkedin || "",
      github: d.github || "",
      location: d.location || "",
      summary: d.summary || "",
      skills: (d.skills || []).map(s => ({
        category: s?.category || "",
        items: Array.isArray(s?.items) ? s.items : [],
      })),
      experience: (d.experience || []).map(e => ({
        title: e?.title || "",
        company: e?.company || "",
        location: e?.location || "",
        start_date: e?.start_date || "",
        end_date: e?.end_date || "",
        bullets: Array.isArray(e?.bullets) ? e.bullets : [],
      })),
      education: (d.education || []).map(e => ({
        degree: e?.degree || "",
        institution: e?.institution || "",
        location: e?.location || "",
        graduation: e?.graduation || "",
        notes: e?.notes || "",
      })),
      certifications: (d.certifications || []).map(c => ({
        name: c?.name || "",
        issuer: c?.issuer || "",
        year: c?.year || "",
      })),
      projects: (d.projects || []).map(p => ({
        name: p?.name || "",
        description: p?.description || "",
        tech: Array.isArray(p?.tech) ? p.tech : [],
        url: p?.url || "",
      })),
      analysis: {
        ats_score_before: d.analysis?.ats_score_before ?? 0,
        ats_score_after: d.analysis?.ats_score_after ?? 0,
        weak_phrases_upgraded: d.analysis?.weak_phrases_upgraded ?? 0,
        achievements_quantified: d.analysis?.achievements_quantified ?? 0,
        action_verbs_count: d.analysis?.action_verbs_count ?? 0,
        key_improvements: Array.isArray(d.analysis?.key_improvements) ? d.analysis.key_improvements : [],
        missing_info: Array.isArray(d.analysis?.missing_info) ? d.analysis.missing_info : [],
      },
    };
  }

  const handleGenerate = useCallback(async () => {
    if (!rawText.trim()) {
      setError("Please describe your experience before generating.");
      return;
    }

    const currentQuota = getQuotaState();
    if (!currentQuota.isPro && currentQuota.remaining <= 0) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResumeData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, jobDescription, targetPages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const raw = await res.json();
      const data = normalizeResumeData(raw);
      setResumeData(data);

      consumeCredit();
      setQuota(getQuotaState());

      const entry: HistoryEntry = {
        timestamp: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        name: data.name || "Unknown",
        ats_before: data.analysis?.ats_score_before || 0,
        ats_after: data.analysis?.ats_score_after || 0,
        raw_input: rawText,
        snippet: rawText.slice(0, 120).replace(/\n/g, " "),
        resume_data: data,
      };
      setHistory((prev) => [...prev, entry]);
      setTimeout(() => smoothScrollTo(0, 500), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [rawText, jobDescription, targetPages]);

  const handleLoadSample = useCallback(() => {
    setRawText(SAMPLE_TECHNICAL_RAW_TEXT);
    setResumeData(SAMPLE_TECHNICAL_RESUME_DATA);
    setError(null);
    setTimeout(() => smoothScrollTo(0, 500), 100);
  }, []);

  const handleLoadEntry = useCallback(
    (index: number) => {
      const entry = history[index];
      if (entry) {
        setRawText(entry.raw_input);
        setResumeData(normalizeResumeData(entry.resume_data as unknown as Record<string, unknown>));
        setError(null);
        setTimeout(() => smoothScrollTo(0, 500), 100);
      }
    },
    [history]
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("resumelabs_history");
    }
  }, []);

  const handleResumeEdit = useCallback((updated: ResumeData) => {
    setResumeData(updated);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-[#7c3aed] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-[#a78bfa] opacity-[0.03] blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-10 glass-card mx-4 sm:mx-6 lg:mx-8 mt-4 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-white tracking-tight">
            ResumeLabs
          </span>
          <span className="text-xs text-[#94a3b8] font-medium hidden sm:inline">
            ATS Resume Builder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <QuotaBadge quota={quota} onUpgradeClick={() => setShowPaywall(true)} />
          {!quota.isPro && (
            <button
              onClick={() => setShowPaywall(true)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.03] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-crown text-amber-300 text-xs" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <HistorySidebar
              history={history}
              onLoadEntry={handleLoadEntry}
              onClearHistory={handleClearHistory}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {!resumeData && (
                <motion.div
                  key="input-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Hero onLoadSample={handleLoadSample} />

                  <div className="mt-6 glass-card p-6 sm:p-8">
                    <ResumeInput
                      value={rawText}
                      onChange={setRawText}
                      onGenerate={handleGenerate}
                      isLoading={isLoading}
                      onLoadSample={handleLoadSample}
                      targetPages={targetPages}
                      onTargetPagesChange={setTargetPages}
                    />

                    <div className="mt-4">
                      <JobMatcher
                        value={jobDescription}
                        onChange={setJobDescription}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 glass-card border-red-500/30 p-4 text-red-400 text-sm"
                    >
                      <i className="fa-solid fa-triangle-exclamation mr-2" />
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {resumeData && (
                <motion.div
                  key="results-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <i className="fa-solid fa-check text-emerald-400 text-sm" />
                      </div>
                      <p className="text-sm text-white">
                        Resume for{" "}
                        <span className="font-bold text-[#a78bfa]">
                          {resumeData.name}
                        </span>{" "}
                        is ready. Review, edit, and download below.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setResumeData(null);
                        setError(null);
                      }}
                      className="btn-secondary text-xs"
                    >
                      <i className="fa-solid fa-arrow-left mr-1.5" />
                      New Resume
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="glass-card p-5">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                          Interactive Editor
                        </h3>
                        <ResumeEditor
                          data={resumeData}
                          onChange={handleResumeEdit}
                          onFocusSection={setActiveSection}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                            Live Preview
                          </h3>
                          <PDFExport
                            candidateName={resumeData.name || "Resume"}
                          />
                        </div>
                        <div className="max-h-[750px] overflow-hidden rounded-xl bg-black/40 border border-white/10 p-2">
                          <ResumePreview data={resumeData} activeSection={activeSection} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 glass-card p-6">
                    <AnalyticsDashboard
                      data={resumeData}
                      rawText={rawText}
                    />
                  </div>

                  <div className="mt-6 glass-card p-4">
                    <button
                      onClick={() => setShowJsonViewer(!showJsonViewer)}
                      className="w-full flex items-center justify-between text-sm text-[#94a3b8] hover:text-white transition-colors"
                    >
                      <span className="font-semibold">
                        <i className="fa-solid fa-code mr-2" />
                        View extracted resume data (JSON)
                      </span>
                      <i
                        className={`fa-solid fa-chevron-down transition-transform duration-200 ${
                          showJsonViewer ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {showJsonViewer && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <pre className="mt-4 p-4 bg-[#0a0a0f] rounded-lg text-xs text-[#a78bfa] overflow-x-auto font-mono max-h-96 overflow-y-auto">
                            {JSON.stringify(resumeData, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="mt-8 pb-8 text-center text-xs text-[#64748b] leading-relaxed border-t border-[rgba(255,255,255,0.06)] pt-6">
              ResumeLabs by{" "}
              <a
                href="https://deenlabs.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c3aed] font-semibold hover:text-[#a78bfa] transition-colors"
              >
                deenlabs.tech
              </a>{" "}
              · Powered by Google Gemini AI
              <br />
              No resume data is stored or logged · History is browser-session
              only · Free to use
            </footer>
          </main>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        {history.length > 0 && (
          <button
            onClick={() => {
              const el = document.getElementById("mobile-history");
              if (el) el.classList.toggle("hidden");
            }}
            className="w-12 h-12 rounded-full bg-[#7c3aed] text-white shadow-lg flex items-center justify-center"
          >
            <i className="fa-solid fa-clock-rotate-left" />
          </button>
        )}
      </div>
      <div
        id="mobile-history"
        className="hidden lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <div className="max-w-sm mx-auto">
          <button
            onClick={() => {
              const el = document.getElementById("mobile-history");
              if (el) el.classList.add("hidden");
            }}
            className="mb-4 text-white text-sm"
          >
            <i className="fa-solid fa-xmark mr-2" />
            Close
          </button>
          <HistorySidebar
            history={history}
            onLoadEntry={(i) => {
              handleLoadEntry(i);
              const el = document.getElementById("mobile-history");
              if (el) el.classList.add("hidden");
            }}
            onClearHistory={handleClearHistory}
          />
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => setQuota(getQuotaState())}
      />
    </div>
  );
}
