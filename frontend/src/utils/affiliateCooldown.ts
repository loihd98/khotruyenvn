/**
 * Affiliate popup cooldown utility.
 * Tracks shown affiliate links by targetUrl with a 12-hour cooldown.
 * If a link was shown within the last 12 hours, skip the popup.
 */

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours
const STORAGE_PREFIX = "aff_shown_";

/**
 * Check if an affiliate link is currently in cooldown (was shown within 12h).
 */
export function isAffiliateCooldown(targetUrl: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = STORAGE_PREFIX + btoa(targetUrl).slice(0, 40);
    const stored = localStorage.getItem(key);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < COOLDOWN_MS;
  } catch {
    return false;
  }
}

/**
 * Mark an affiliate link as shown (start 12h cooldown).
 */
export function markAffiliateShown(targetUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = STORAGE_PREFIX + btoa(targetUrl).slice(0, 40);
    localStorage.setItem(key, Date.now().toString());
  } catch {
    // localStorage might be full or unavailable
  }
}
