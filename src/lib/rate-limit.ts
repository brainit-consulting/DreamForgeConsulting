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
