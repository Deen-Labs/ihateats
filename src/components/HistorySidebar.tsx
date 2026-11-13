"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HistoryEntry } from "@/lib/schema";

interface HistorySidebarProps {
  history: HistoryEntry[];
  onLoadEntry: (index: number) => void;
  onClearHistory: () => void;
}

export default function HistorySidebar({ history, onLoadEntry, onClearHistory }: HistorySidebarProps) {
  return (
    <div className="bg-[#12121a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="uppercase tracking-widest text-[10px] font-semibold text-slate-400">Session History</h2>
        {history.length > 0 && (
          <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {history.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {history.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-slate-500 text-sm">
            <p className="mb-2">Generated resumes will appear here.</p>
            <p className="text-xs">History lives in this browser tab only</p>
          </div>
        ) : (
          <AnimatePresence>
            {history.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#12121a] border border-white/5 rounded-xl p-3 hover:border-violet-500/30 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-sm truncate pr-2">{entry.name || "Untitled Resume"}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap text-right">
                    {entry.timestamp.split(', ')[1] || entry.timestamp}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2 text-xs font-medium">
                  <span className="bg-[#f97316]/20 text-[#f97316] px-2 py-0.5 rounded-md">
                    ATS: {entry.ats_before}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-md">
                    ATS: {entry.ats_after}
                  </span>
                </div>
                
                <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                  {entry.snippet}
                </p>
                
                <button
                  onClick={() => onLoadEntry(idx)}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-violet-600/20 hover:text-violet-300 text-slate-300 transition-colors border border-white/5"
                >
                  Load this entry
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {history.length > 0 && (
        <button
          onClick={onClearHistory}
          className="mt-4 w-full py-2 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 shrink-0"
        >
          Clear history
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-white/5 space-y-3 shrink-0">
        <div className="bg-[#12121a] border border-white/5 rounded-xl p-3">
          <h4 className="text-violet-400 text-xs font-medium mb-2">ATS Compliance Checklist</h4>
          <ul className="text-xs text-slate-400 space-y-1.5">
            <li className="flex items-start"><span className="text-[#10b981] mr-1.5">✓</span> Standard single-column layout</li>
            <li className="flex items-start"><span className="text-[#10b981] mr-1.5">✓</span> High-impact action verbs (AI-optimized)</li>
            <li className="flex items-start"><span className="text-[#10b981] mr-1.5">✓</span> Quantified metrics (~ for estimates)</li>
            <li className="flex items-start"><span className="text-[#10b981] mr-1.5">✓</span> No graphics or text boxes that confuse parsers</li>
          </ul>
        </div>
        
        <div className="bg-[#12121a] border border-white/5 rounded-xl p-3">
          <h4 className="text-violet-400 text-xs font-medium mb-1">Pro Tips</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Need to adjust? Use the interactive editor tabs to modify fields and see changes live.
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center shrink-0">
        <p className="text-[10px] text-slate-600">
          History lives in this browser tab only. Zero data stored on any server.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
