"use client";

import React from "react";
import { Download, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import type { ResumeData } from "@/lib/schema";
import { generateLatexSource } from "@/lib/latexExport";

interface PDFExportProps {
  candidateName: string;
  data: ResumeData;
}

export default function PDFExport({ candidateName, data }: PDFExportProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanName = (candidateName || "Resume").replace(/\s+/g, "_");
    document.title = `${cleanName}_Resume`;

    const printTarget = document.getElementById("resume-print-target");
    if (!printTarget) {
      window.print();
      document.title = originalTitle;
      return;
    }

    // Create isolated container at body level to eliminate blank pages from parent wrappers
    const container = document.createElement("div");
    container.id = "dedicated-print-container";
    const clone = printTarget.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.position = "static";
    clone.style.width = "100%";
    clone.style.height = "auto";
    clone.style.boxShadow = "none";

    // Preserve density & format styling from live preview
    clone.style.padding = printTarget.style.padding;
    clone.style.fontSize = printTarget.style.fontSize;
    clone.style.lineHeight = printTarget.style.lineHeight;
    clone.style.fontFamily = printTarget.style.fontFamily;

    container.appendChild(clone);

    document.body.appendChild(container);
    document.body.classList.add("printing-resume");

    // Trigger browser print dialog
    window.print();

    // Clean up immediately after print dialog closes
    document.body.classList.remove("printing-resume");
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    document.title = originalTitle;
  };

  const handleLatexExport = () => {
    try {
      const latexSource = generateLatexSource(data);
      const blob = new Blob([latexSource], { type: "text/x-tex;charset=utf-8" });
      const cleanName = (candidateName || "Resume").replace(/\s+/g, "_");
      const filename = `${cleanName}_Resume.tex`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("LaTeX export error:", err);
      alert("Failed to export LaTeX file.");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePrint}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-white text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-md shadow-emerald-500/20 transition-all border border-emerald-400/30 cursor-pointer"
        title="Print or Save as PDF"
      >
        <Download size={15} />
        <span>Download Resume (PDF)</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLatexExport}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-slate-200 hover:text-white text-xs bg-white/5 hover:bg-white/10 shadow-md transition-all border border-white/10 hover:border-violet-500/40 cursor-pointer"
        title="Download pure LaTeX source code (.tex) based on Jake's Resume format"
      >
        <FileCode size={15} className="text-violet-400" />
        <span>Export .TEX (LaTeX)</span>
      </motion.button>
    </div>
  );
}
