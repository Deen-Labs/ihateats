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

  const hasJobMatchData = analysis.job_match_score !== undefined || (analysis.matched_keywords && analysis.matched_keywords.length > 0);

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl bg-[#12121a] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Resume Analysis Report</h2>
        {hasJobMatchData && (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-bullseye text-xs text-emerald-400" />
            Target Job Description Aligned ({analysis.job_match_score || 90}% Match)
          </span>
        )}
      </div>
      
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

      {/* Target Job Description Matcher Report Card */}
      {hasJobMatchData && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-950/20 via-[#0a0a0f] to-cyan-950/20 border border-emerald-500/30 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center flex-wrap gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-emerald-400 text-lg" />
              <h3 className="text-base font-bold text-white">Target Job Keyword Alignment</h3>
            </div>
            <span className="text-2xl font-black text-emerald-400">
              {analysis.job_match_score || 90}% <span className="text-xs text-slate-400 font-normal">Match Score</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-400" />
                Matched Target Keywords ({analysis.matched_keywords?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.matched_keywords && analysis.matched_keywords.length > 0 ? (
                  analysis.matched_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1">
                      <i className="fa-solid fa-check text-[10px] text-emerald-400" />
                      {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-1">No specific keywords matched yet.</p>
                )}
              </div>
            </div>

            {/* Recommended Missing Keywords */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-lightbulb text-amber-400" />
                Recommended Skills to Highlight ({analysis.missing_target_keywords?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.missing_target_keywords && analysis.missing_target_keywords.length > 0 ? (
                  analysis.missing_target_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1">
                      <i className="fa-solid fa-plus text-[10px] text-amber-400" />
                      {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-1">All primary target keywords are well covered!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col p-6 rounded-xl bg-[#0a0a0f] border border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Key Improvements</h3>
            <ul className="flex flex-col gap-3">
              {(analysis.key_improvements || ["Action verbs added", "ATS layout structured"]).map((imp, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col p-6 rounded-xl bg-[#0a0a0f] border border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Word Count Impact</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Original Input</span>
                  <span>{rawWordCount} words</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-slate-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (rawWordCount / maxWords) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Optimised Resume</span>
                  <span>{newWordCount} words</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (newWordCount / maxWords) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ value, subtitle }: { value: string | number; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0a0a0f] border border-white/5 text-center">
      <span className="text-2xl md:text-3xl font-black text-white mb-1">{value}</span>
      <span className="text-xs text-slate-400 font-medium leading-tight">{subtitle}</span>
    </div>
  );
}
