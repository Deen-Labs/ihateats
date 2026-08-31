export interface QuotaState {
  remaining: number;
  limit: number;
  isPro: boolean;
  isDev?: boolean;
  planName?: string;
  expiresAt?: string;
}

const STORAGE_KEY = "resumelabs_quota_v1";
const DEV_MODE_KEY = "resumelabs_dev_mode";

export function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Check URL parameter first (e.g. ?dev=true or ?dev=deenlabs)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("dev")) {
      const devVal = urlParams.get("dev");
      if (devVal === "true" || devVal === "deenlabs" || devVal === "1" || devVal === "") {
        localStorage.setItem(DEV_MODE_KEY, "true");
        return true;
      }
    }
    return localStorage.getItem(DEV_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function enableDevMode(): boolean {
  if (typeof window === "undefined") return false;
  localStorage.setItem(DEV_MODE_KEY, "true");
  return true;
}

export function disableDevMode(): boolean {
  if (typeof window === "undefined") return false;
  localStorage.removeItem(DEV_MODE_KEY);
  return false;
}

export function toggleDevMode(): boolean {
  if (isDevMode()) {
    disableDevMode();
    return false;
  } else {
    enableDevMode();
    return true;
  }
}

export function getQuotaState(): QuotaState {
  if (typeof window === "undefined") {
    return { remaining: 2, limit: 2, isPro: false };
  }

  // Developer Mode Bypass
  if (isDevMode()) {
    return {
      remaining: 99999,
      limit: 99999,
      isPro: true,
      isDev: true,
      planName: "🛠️ Dev Mode (Unlimited)",
    };
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

  if (isDevMode()) return true; // Developer mode never consumes credits

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
