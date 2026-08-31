"use client";

import React from "react";
import type { QuotaState } from "@/lib/quota";

interface QuotaBadgeProps {
  quota: QuotaState;
  onUpgradeClick: () => void;
}

export default function QuotaBadge({ quota, onUpgradeClick }: QuotaBadgeProps) {
  if (quota.isDev) {
    return (
      <button
        onClick={onUpgradeClick}
        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-2 hover:scale-[1.03] transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
        title="Developer Mode Active (Unlimited Generations)"
      >
        <i className="fa-solid fa-code text-cyan-400 text-xs animate-pulse" />
        <span>🛠️ Dev Mode (Unlimited)</span>
      </button>
    );
  }

  if (quota.isPro) {
    return (
      <button
        onClick={onUpgradeClick}
        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 hover:scale-[1.03] transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
      >
        <i className="fa-solid fa-crown text-amber-400 text-xs animate-pulse" />
        <span>{quota.planName || "Pro Unlimited"}</span>
      </button>
    );
  }

  const isLow = quota.remaining <= 0;

  return (
    <button
      onClick={onUpgradeClick}
      className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.03] cursor-pointer ${
        isLow
          ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
          : "bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#38bdf8]"
      }`}
    >
      <i className={`fa-solid ${isLow ? "fa-fire text-rose-400" : "fa-bolt text-cyan-400"}`} />
      <span>
        {quota.remaining} / {quota.limit} Free Rewrites
      </span>
      {isLow && <span className="underline font-bold ml-1">Upgrade</span>}
    </button>
  );
}
