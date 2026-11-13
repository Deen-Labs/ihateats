"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResumeData, HistoryEntry } from "@/lib/schema";
import ResumeInput from "@/components/ResumeInput";
import JobMatcher from "@/components/JobMatcher";
import HistorySidebar from "@/components/HistorySidebar";
import ResumePreview from "@/components/ResumePreview";
import ResumeEditor from "@/components/ResumeEditor";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PDFExport from "@/components/PDFExport";
import QuotaBadge from "@/components/QuotaBadge";
import PaywallModal from "@/components/PaywallModal";
import { getQuotaState, consumeCredit, toggleDevMode, type QuotaState } from "@/lib/quota";

import { SAMPLE_TECHNICAL_RAW_TEXT, SAMPLE_TECHNICAL_RESUME_DATA } from "@/lib/sampleData";
import { smoothScrollTo } from "@/lib/smoothScroll";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ihateats_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ihateats_history", JSON.stringify(history));
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
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setQuota(getQuotaState());

    // Keyboard Shortcut Ctrl + Shift + D (or Cmd + Shift + D) to toggle Dev Mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        const active = toggleDevMode();
        setQuota(getQuotaState());
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          alert(active ? "Developer Mode ENABLED (Unlimited AI Generations)" : "Developer Mode DISABLED (Free Tier Restored)");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  const handleOpenBlankEditor = useCallback(() => {
    setResumeData({
      name: "Your Name",
      email: "your.email@example.com",
      phone: "+1 (555) 000-0000",
      location: "City, State",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      summary: "Results-driven professional with experience in technical execution, architecture, and cross-functional leadership.",
      skills: [
        {
          category: "Technical Skills",
          items: ["System Architecture", "Cloud Services", "API Integration"],
        },
      ],
      experience: [
        {
          title: "Senior Role",
          company: "Company Name",
          location: "Location",
          start_date: "2023",
          end_date: "Present",
          bullets: [
            "Architected and deployed scalable systems, improving throughput by 25%.",
            "Led cross-functional initiatives delivering critical milestones ahead of schedule.",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science or Related Field",
          institution: "University Name",
          location: "Location",
          graduation: "2022",
          notes: "",
        },
      ],
      certifications: [],
      projects: [],
      analysis: {
        ats_score_before: 50,
        ats_score_after: 88,
        weak_phrases_upgraded: 0,
        achievements_quantified: 2,
        action_verbs_count: 2,
        key_improvements: ["Draft initialized directly in Interactive Editor."],
        missing_info: [],
      },
    });
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
      localStorage.removeItem("ihateats_history");
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
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              const nextCount = logoClickCount + 1;
              setLogoClickCount(nextCount);
              if (nextCount >= 5) {
                setLogoClickCount(0);
                const active = toggleDevMode();
                setQuota(getQuotaState());
                if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                  alert(
                    active
                      ? "Developer Mode ENABLED (Unlimited AI Generations)"
                      : "Developer Mode DISABLED (Free Tier Restored)"
                  );
                }
              }
            }}
            className="flex items-center cursor-pointer select-none group"
            title="Click 5 times to toggle Developer Mode"
          >
            <img 
              src="/ihateats-logo.png" 
              alt="ihateATS Logo" 
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform" 
            />
          </div>
          <span className="text-xs text-[#94a3b8] font-medium hidden sm:inline">
            ATS Resume Builder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:border-violet-500/40"
            title="Open Session History"
          >
            <i className="fa-solid fa-clock-rotate-left text-xs text-violet-400" />
            <span>History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                {history.length}
              </span>
            )}
          </button>

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main className="w-full">
          <AnimatePresence mode="wait">
            {!resumeData && (
              <motion.div
                key="input-phase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                {/* Fast-Track Header */}
                <div className="text-center mt-2 mb-8">
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#06b6d4]/15 to-[#7c3aed]/15 border border-[#06b6d4]/30 text-[#38bdf8] text-[11px] font-semibold tracking-wider uppercase inline-flex items-center gap-2 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping" />
                    ATS-Optimised · AI Powered · Free Forever
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Build a Recruiter-Ready{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#7c3aed]">
                      ATS Resume
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
                    Paste your rough notes or LinkedIn, upload an existing resume, or jump straight into the Interactive Editor.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <button
                      onClick={handleLoadSample}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#06b6d4] via-[#7c3aed] to-[#a78bfa] text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-bolt text-cyan-200" />
                      <span>Load Sample Demo & Open Editor</span>
                    </button>

                    <button
                      onClick={handleOpenBlankEditor}
                      className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen-to-square text-violet-400" />
                      <span>Start Blank in Editor &rarr;</span>
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8 shadow-2xl">
                  <ResumeInput
                    value={rawText}
                    onChange={setRawText}
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    onLoadSample={handleLoadSample}
                    targetPages={targetPages}
                    onTargetPagesChange={setTargetPages}
                  />
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
                        <div className="h-[750px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-black/40 border border-white/10 p-2">
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
              ihateATS by{" "}
              <a
                href="https://deenlabs.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c3aed] font-semibold hover:text-[#a78bfa] transition-colors"
              >
                deenlabs.tech
              </a>{" "}
              ⚡ Powered by Lab Engine
              <br />
              No resume data is stored or logged · History is browser-session
              only · Free to use
            </footer>
          </main>
        </div>

        {/* Collapsible Session History Slide-Over Drawer */}
        <AnimatePresence>
          {isHistoryOpen && (
            <div className="fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHistoryOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                className="relative z-10 w-80 sm:w-96 max-w-[85vw] h-full bg-[#0d0d14] border-r border-white/10 shadow-2xl flex flex-col p-4 sm:p-5"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-violet-400 text-sm" />
                    <span className="text-sm font-bold text-white tracking-wide">
                      Session History
                    </span>
                    {history.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {history.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close History"
                  >
                    <i className="fa-solid fa-xmark text-sm" />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <HistorySidebar
                    history={history}
                    onLoadEntry={(i) => {
                      handleLoadEntry(i);
                      setIsHistoryOpen(false);
                    }}
                    onClearHistory={handleClearHistory}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => setQuota(getQuotaState())}
        />
      </div>
    );
  }
