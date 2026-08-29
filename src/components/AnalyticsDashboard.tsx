"use client";

import React from "react";
import ScoreGauge from "./ScoreGauge";
import { ResumeData } from "@/lib/schema";

interface AnalyticsDashboardProps {
  data: ResumeData;
  rawText: string;
}

export default function AnalyticsDashboard({ data, rawText }: AnalyticsDashboardProps) {
  const analysis = data.analysis || {};
  
  const beforeScore = analysis.ats_score_before || 0;
  const afterScore = analysis.ats_score_after || 0;
  const scoreGain = afterScore - beforeScore;
  
  const skillCount = (data.skills || []).reduce((acc, cat) => acc + (cat.items || []).length, 0);
  const skillCategories = (data.skills || []).length;

  const experienceBullets = (data.experience || []).reduce((acc, exp) => acc + (exp.bullets || []).length, 0);
  const educationItems = (data.education || []).length;
  const certItems = (data.certifications || []).length;
  const projectItems = (data.projects || []).length;
  const summaryLength = (data.summary || "").length > 0 ? 1 : 0;
  
  const chartData = [
    { label: "Experience", count: experienceBullets, color: "#7c3aed" },
    { label: "Skills", count: skillCount, color: "#10b981" },
    { label: "Education", count: educationItems, color: "#3b82f6" },
    { label: "Certifications", count: certItems, color: "#8b5cf6" },
    { label: "Projects", count: projectItems, color: "#f59e0b" },
    { label: "Summary", count: summaryLength, color: "#64748b" },
  ].filter(d => d.count > 0);
  
  const totalItems = chartData.reduce((acc, d) => acc + d.count, 0);
  
  let currentOffset = 0;
  const chartSegments = chartData.map(d => {
    const percentage = totalItems === 0 ? 0 : d.count / totalItems;
    const circumference = 2 * Math.PI * 50;
    const strokeLength = percentage * circumference;
    const segment = {
      ...d,
      strokeDasharray: `${strokeLength} ${circumference}`,
      strokeDashoffset: -currentOffset,
    };
    currentOffset += strokeLength;
    return segment;
  });

  const rawWordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  const newText = [
    data.summary || "",
    ...(data.experience || []).flatMap(e => e.bullets || []),
    ...(data.skills || []).flatMap(s => s.items || []),
    ...(data.projects || []).map(p => p.description || "")
  ].join(" ");
  const newWordCount = newText.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = Math.max(rawWordCount, newWordCount, 1);

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl bg-[#12121a] border border-white/5 shadow-2xl">
      <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-2">Resume Analysis Report</h2>
      
      <div className="flex flex-col md:flex-row justify-center gap-8 py-4">
        <ScoreGauge score={beforeScore} label="ATS Score — Before" color="#f97316" />
        <ScoreGauge score={afterScore} label="ATS Score — After" color="#10b981" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard value={scoreGain > 0 ? `+${scoreGain}` : scoreGain} subtitle="ATS Score Gain" />
        <MetricCard value={analysis.weak_phrases_upgraded || 0} subtitle="weak verbs replaced" />
        <MetricCard value={analysis.achievements_quantified || 0} subtitle="metrics added" />
        <MetricCard value={skillCount} subtitle={`across ${skillCategories} categories`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col p-6 rounded-xl bg-[#0a0a0f] border border-white/5">
          <h3 className="text-lg font-medium text-white mb-6">Resume Composition</h3>
          <div className="flex flex-col items-center">
            <svg className="w-48 h-48 transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
              {chartSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              ))}
            </svg>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-8">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-xs font-medium text-slate-300">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-[#0a0a0f] border border-white/5 flex-1">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Key Improvements</h3>
            <ul className="space-y-3">
              {(analysis.key_improvements || []).map((imp, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-[#10b981] mt-0.5 text-lg">•</span>
                  <span>{imp}</span>
                </li>
              ))}
              {(!analysis.key_improvements || analysis.key_improvements.length === 0) && (
                <li className="text-sm text-slate-500 italic">No specific improvements found.</li>
              )}
            </ul>
          </div>
          
          <div className="p-6 rounded-xl bg-[#0a0a0f] border border-white/5 flex-1">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Missing Info (Recommended)</h3>
            <ul className="space-y-3">
              {(analysis.missing_info || []).map((info, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-slate-500 mt-0.5 text-lg">•</span>
                  <span>{info}</span>
                </li>
              ))}
              {(!analysis.missing_info || analysis.missing_info.length === 0) && (
                <li className="text-sm text-slate-500 italic">No missing information detected.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-2 p-6 rounded-xl bg-[#0a0a0f] border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Word Count Comparison</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Original Input</span>
              <span>{rawWordCount} words</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(rawWordCount / maxWords) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Optimised Resume</span>
              <span>{newWordCount} words</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7c3aed] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(newWordCount / maxWords) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ value, subtitle }: { value: React.ReactNode; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#0a0a0f] border border-white/5 transition-colors hover:border-[#7c3aed]/30">
      <span className="text-3xl font-bold text-white mb-2">{value}</span>
      <span className="text-xs font-medium text-center text-slate-400 uppercase tracking-wider">{subtitle}</span>
    </div>
  );
}
