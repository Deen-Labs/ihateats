"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  label: string;
  color: string;
}

export default function ScoreGauge({ score, label, color }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1000;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplayScore(Math.floor(progress * score));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* 0-40 Coral Zone */}
          <circle
            cx="70" cy="70" r={radius}
            stroke="#f97316" strokeWidth="12" fill="transparent"
            strokeDasharray={`${0.4 * circumference} ${circumference}`}
            strokeDashoffset={0}
            opacity={0.15}
          />
          {/* 40-70 Yellow Zone */}
          <circle
            cx="70" cy="70" r={radius}
            stroke="#eab308" strokeWidth="12" fill="transparent"
            strokeDasharray={`${0.3 * circumference} ${circumference}`}
            strokeDashoffset={-(0.4 * circumference)}
            opacity={0.15}
          />
          {/* 70-100 Green Zone */}
          <circle
            cx="70" cy="70" r={radius}
            stroke="#10b981" strokeWidth="12" fill="transparent"
            strokeDasharray={`${0.3 * circumference} ${circumference}`}
            strokeDashoffset={-(0.7 * circumference)}
            opacity={0.15}
          />
          
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{displayScore}</span>
          <span className="text-xs text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <span className="mt-6 text-xs font-semibold text-slate-300 tracking-wider uppercase">{label}</span>
    </div>
  );
}
