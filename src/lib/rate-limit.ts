// ── General IP-based sliding-window rate limiter ──────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const limitStore = new Map<string, RateLimitEntry>();

export function checkLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = limitStore.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    limitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: windowMs - (now - entry.windowStart),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: windowMs - (now - entry.windowStart),
  };
}

// ── Resend email throttle ─────────────────────────────────────────

const MAX_REQUESTS_PER_SECOND = 4; // Stay under Resend's 5/sec limit
const WINDOW_MS = 1000;

const timestamps: number[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wait if we're approaching the Resend rate limit (5 req/sec) */
export async function throttle(): Promise<void> {
  const now = Date.now();

  // Remove timestamps older than the window
  while (timestamps.length > 0 && timestamps[0] < now - WINDOW_MS) {
    timestamps.shift();
  }

  // If at capacity, wait until the oldest request exits the window
  if (timestamps.length >= MAX_REQUESTS_PER_SECOND) {
    const waitUntil = timestamps[0] + WINDOW_MS;
    const delay = waitUntil - now;
    if (delay > 0) {
      await sleep(delay + 50); // +50ms safety margin
    }
  }

  timestamps.push(Date.now());
}
