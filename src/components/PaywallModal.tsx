"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { activateProPlan } from "@/lib/quota";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  period: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

const B2C_PLANS: PlanOption[] = [
  {
    id: "weekly",
    name: "Weekly Job Hunt Pass",
    price: 199,
    period: "7 Days Access",
    popular: true,
    badge: "MOST POPULAR FOR JOB SEEKERS",
    features: [
      "âš¡ 7 Days Unlimited AI Resume Rewrites",
      "ðŸ“„ Jake's LaTeX 1-Page & 2-Page PDF Export",
      "ðŸŽ¯ Full Interactive Form Editor & Session History",
      "ðŸš€ Zero Daily Quota Limits",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Pro",
    price: 399,
    period: "per month",
    features: [
      "âš¡ Unlimited AI Resume Generations",
      "ðŸŽ¯ Job Description Keyword Matcher",
      "ðŸ“‘ Executive 2-Page & Single Page Fitting",
      "ðŸ“„ Export Raw LaTeX (.tex) Code",
      "ðŸš€ Priority AI Model Processing Pipeline",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime Pass",
    price: 999,
    period: "One-Time Payment",
    badge: "BEST LONG TERM VALUE",
    features: [
      "ðŸ‘‘ Lifetime Unlimited Access",
      "âš¡ Never Pay Again & Zero Subscriptions",
      "ðŸŽ¯ Full Recruiter Suite & Job Matcher",
      "ðŸš€ All Future AI Upgrades Included",
    ],
  },
];

const B2B_PLANS: PlanOption[] = [
  {
    id: "b2b_starter",
    name: "B2B Starter",
    price: 1999,
    period: "per month",
    features: [
      "ðŸ“¦ 500 Candidate Resume Extractions / Month",
      "ðŸ“Š Bulk Candidate Data CSV / Excel Export",
      "âš¡ 2-Second Batch Processing Speed",
      "ðŸ’¼ Email Support for Recruiting Teams",
    ],
  },
  {
    id: "b2b_agency",
    name: "B2B Agency",
    price: 4999,
    period: "per month",
    popular: true,
    badge: "RECOMMENDED FOR IT CONSULTANCIES",
    features: [
      "ðŸ“¦ 2,000 Candidate Resume Extractions / Month",
      "ðŸŽ¯ AI Candidate-to-Job Match Ranking",
      "ðŸ¢ White-Label Company Branded PDF Export",
      "ðŸ“Š Bulk CSV & Excel Database Exporter",
      "ðŸš€ Priority HR Support",
    ],
  },
  {
    id: "b2b_enterprise",
    name: "Enterprise REST API",
    price: 14999,
    period: "per month",
    features: [
      "ðŸ”Œ 10,000 Resume Extractions / Month",
      "ðŸ”‘ Developer REST API Key (x-api-key)",
      "Webhook & ATS Workday/Greenhouse Integration",
      "ðŸ¢ Custom White-Label PDF Templates",
      "ðŸ“ž Dedicated Account Manager",
    ],
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaywallModal({ isOpen, onClose, onSuccess }: PaywallModalProps) {
  const [tab, setTab] = useState<"b2c" | "b2b">("b2c");
  const [selectedPlan, setSelectedPlan] = useState<string>("weekly");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPlans = tab === "b2c" ? B2C_PLANS : B2B_PLANS;
  const activePlanObj = currentPlans.find((p) => p.id === selectedPlan) || currentPlans[0];

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: activePlanObj.id,
          amount: activePlanObj.price,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate Razorpay order.");
      }

      // Check if sandbox / mock order (if API keys not set in env)
      if (orderData.isSandbox) {
        // Activate immediately in sandbox mode
        activateProPlan(activePlanObj.id);
        setIsProcessing(false);
        onSuccess();
        onClose();
        alert(`ðŸŽ‰ Sandbox Payment Successful! Activated ${activePlanObj.name}.`);
        return;
      }

      // 2. Open Razorpay Checkout Dialog
      const rawKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      const razorpayKey = rawKey.replace(/^[^=]+=\s*/, "").replace(/^["']|["']$/g, "").trim() || "rzp_test_5123456789";

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "ihateATS Pro",
        description: `${activePlanObj.name} â€” ${activePlanObj.period}`,
        order_id: orderData.id,
        theme: { color: "#7c3aed" },
        handler: async function (response: any) {
          // Verify signature on server
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: activePlanObj.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            activateProPlan(activePlanObj.id);
            onSuccess();
            onClose();
            alert(`ðŸŽ‰ Payment Successful! Welcome to ${activePlanObj.name}.`);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        setIsProcessing(false);
        onClose(); // Hide paywall modal so Razorpay iframe is cleanly focused uncropped
        rzp.open();
      } else {
        // Fallback sandbox activation if Razorpay checkout script isn't loaded
        activateProPlan(activePlanObj.id);
        setIsProcessing(false);
        onSuccess();
        onClose();
        alert(`ðŸŽ‰ Payment Successful! Activated ${activePlanObj.name}.`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(124,58,237,0.25)] overflow-hidden z-10 my-8"
        >
          {/* Ambient Glow */}
          <div className="absolute top-[-30%] left-[20%] w-[400px] h-[400px] bg-[#06b6d4] opacity-[0.12] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[20%] w-[400px] h-[400px] bg-[#7c3aed] opacity-[0.15] blur-[100px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 border border-[#06b6d4]/30 text-[#38bdf8] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
              <i className="fa-solid fa-[#06b6d4] fa-bolt text-xs" />
              ihateATS Pro & B2B Suite
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Unlock <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#7c3aed]">Unlimited AI Generations</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Choose a plan to bypass daily quotas, unlock raw LaTeX exports, and process candidate resumes instantly.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-[#0a0a0f] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  setTab("b2c");
                  setSelectedPlan("weekly");
                }}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  tab === "b2c"
                    ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <i className="fa-solid fa-user text-xs" />
                <span>Job Seekers (B2C)</span>
              </button>
              <button
                onClick={() => {
                  setTab("b2b");
                  setSelectedPlan("b2b_agency");
                }}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  tab === "b2b"
                    ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <i className="fa-solid fa-building text-xs" />
                <span>Businesses & Recruiters (B2B)</span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {currentPlans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-b from-[#7c3aed]/20 to-transparent border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.02]"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-[10px] font-extrabold uppercase text-white shadow-sm whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2 pt-1">
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#06b6d4] bg-[#06b6d4]"
                            : "border-slate-500"
                        }`}
                      >
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white" />}
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-black text-white">â‚¹{plan.price}</span>
                      <span className="text-slate-400 text-xs ml-1.5">{plan.period}</span>
                    </div>

                    <div className="space-y-2 border-t border-white/5 pt-4">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <i className="fa-solid fa-check text-[#06b6d4] text-[10px] mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <i className="fa-solid fa-shield-halved text-[#06b6d4] text-base" />
              <span>
                Secured by <strong className="text-white">Razorpay</strong> Â· Instant UPI, GPay, Paytm, Cards
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#06b6d4] via-[#7c3aed] to-[#a78bfa] text-white font-bold text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Processing Razorpay Checkout...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock text-cyan-200" />
                  <span>Unlock {activePlanObj.name} (â‚¹{activePlanObj.price})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

