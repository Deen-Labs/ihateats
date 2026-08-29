export interface QuotaState {
  remaining: number;
  limit: number;
  isPro: boolean;
  planName?: string;
  expiresAt?: string;
}

const STORAGE_KEY = "resumelabs_quota_v1";

export function getQuotaState(): QuotaState {
  if (typeof window === "undefined") {
    return { remaining: 2, limit: 2, isPro: false };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialState: QuotaState = {
        remaining: 2,
        limit: 2,
        isPro: false,
      };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...initialState,
          lastReset: Date.now(),
        })
      );
      return initialState;
    }

    const data = JSON.parse(raw);

    // If user is Pro, check expiration
    if (data.isPro) {
      if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
        // Plan expired, revert to free
        data.isPro = false;
        data.planName = undefined;
      } else {
        return {
          remaining: 9999,
          limit: 9999,
          isPro: true,
          planName: data.planName || "Pro Unlimited",
          expiresAt: data.expiresAt,
        };
      }
    }

    // Free user daily 24-hour reset check
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastReset = data.lastReset || 0;

    if (now - lastReset > ONE_DAY_MS) {
      data.remaining = 2;
      data.lastReset = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return {
      remaining: Math.max(0, data.remaining ?? 2),
      limit: 2,
      isPro: false,
    };
  } catch {
    return { remaining: 2, limit: 2, isPro: false };
  }
}

export function consumeCredit(): boolean {
  if (typeof window === "undefined") return true;

  const current = getQuotaState();
  if (current.isPro) return true;

  if (current.remaining <= 0) {
    return false;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { lastReset: Date.now() };
    data.remaining = Math.max(0, (data.remaining ?? 2) - 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return true;
  }
}

export function activateProPlan(planId: string) {
  if (typeof window === "undefined") return;

  const now = new Date();
  let planName = "Weekly Pass";
  let daysValid = 7;

  if (planId === "monthly") {
    planName = "Monthly Pro";
    daysValid = 30;
  } else if (planId === "lifetime") {
    planName = "Lifetime Unlimited";
    daysValid = 3650; // 10 years
  } else if (planId.startsWith("b2b")) {
    planName = "B2B Recruiter Suite";
    daysValid = 30;
  }

  const expiresAt = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000).toISOString();

  const proState = {
    remaining: 9999,
    limit: 9999,
    isPro: true,
    planName,
    expiresAt,
    lastReset: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(proState));
}
