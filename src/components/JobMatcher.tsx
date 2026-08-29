"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JobMatcherProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobMatcher({ value, onChange }: JobMatcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full rounded-xl bg-[#12121a] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-transparent hover:bg-white/[0.02] transition-colors focus:outline-none"
      >
        <span className="text-white font-medium text-sm sm:text-base">🎯 Job Description Matcher (Optional)</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-slate-400 bg-white/5 p-1.5 rounded-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 border-t border-white/5 bg-[#0a0a0f]/50">
              <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
                The AI will prioritize keywords from this job posting when rewriting your resume. 
                Paste the full job description below for the best results.
              </p>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste a job description to tailor your resume keywords..."
                className="w-full h-40 p-4 rounded-xl bg-[#0a0a0f] text-sm text-slate-200 border border-white/10 placeholder:text-slate-600 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/50 transition-all resize-none custom-scrollbar"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
