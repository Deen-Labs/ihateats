"use client";

import React from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

interface PDFExportProps {
  candidateName: string;
}

export default function PDFExport({ candidateName }: PDFExportProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${candidateName.replace(/\s+/g, "_")}_Resume`;

    const printTarget = document.getElementById("resume-print-target");
    if (!printTarget) {
      window.print();
      document.title = originalTitle;
      return;
    }

    // Create isolated container at body level to eliminate blank pages from parent wrappers
    const container = document.createElement("div");
    container.id = "dedicated-print-container";
    container.appendChild(printTarget.cloneNode(true));

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

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30"
    >
      <Download size={18} />
      <span>Download Resume (PDF)</span>
    </motion.button>
  );
}
