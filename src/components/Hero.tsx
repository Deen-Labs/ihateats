"use client";

import { motion } from "framer-motion";

interface HeroProps {
  onLoadSample?: () => void;
}

export default function Hero({ onLoadSample }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div 
      className="relative w-full max-w-5xl mx-auto mt-12 mb-10 p-8 md:p-12 rounded-3xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] hover:border-[#06b6d4]/30 transition-colors duration-500"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 via-[#7c3aed]/10 to-transparent pointer-events-none" />
      
      <motion.div variants={itemVariants} className="flex justify-center mb-6">
        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#06b6d4]/15 to-[#7c3aed]/15 border border-[#06b6d4]/30 text-[#38bdf8] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
          ATS-Optimised · AI Powered · Free Forever
        </span>
      </motion.div>

      <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-center mb-6 tracking-tight text-white">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#7c3aed]">
          ihateATS
        </span>
      </motion.h1>

      <motion.p variants={itemVariants} className="text-[#94a3b8] text-center text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
        Describe your background in any format — rough notes, a LinkedIn URL, or an old draft. Lab Engine restructures & optimizes it into a clean, recruiter-ready ATS resume.
      </motion.p>

      {onLoadSample && (
        <motion.div variants={itemVariants} className="flex justify-center mb-10">
          <button
            onClick={onLoadSample}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#06b6d4] via-[#7c3aed] to-[#a78bfa] text-white font-bold text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <i className="fa-solid fa-bolt text-cyan-200 animate-bounce" />
            <span>Load Technical Sample Demo (Instant 96 ATS Score)</span>
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 md:gap-4">
        {[
          "1. Input your notes or LinkedIn",
          "2. AI rewrites & scores",
          "3. Live preview & edit",
          "4. Download PDF / LaTeX",
        ].map((step, idx) => (
          <div key={idx} className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-sm font-medium shadow-sm whitespace-nowrap hover:border-[#06b6d4]/40 hover:text-white transition-all duration-300">
            {step}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
