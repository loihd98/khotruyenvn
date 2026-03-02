/**
 * Custom image loader for Next.js.
 *
 * In this Docker deployment nginx serves `/uploads/` directly with
 * aggressive caching (1 year, immutable).  The Next.js image optimizer
 * cannot reliably access volume-mounted files in standalone mode, so
 * we bypass it and let nginx handle image delivery.
 *
 * Static assets imported via `import img from './img.png'` are bundled
 * by webpack at build time and are NOT affected by this loader.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Already a full URL (external images) → return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Upload images served by nginx — return direct path
  // nginx serves with: expires 1y; Cache-Control "public, immutable"
  if (src.startsWith("/uploads/")) {
    return src;
  }

  // Data URIs → return as-is
  if (src.startsWith("data:")) {
    return src;
  }

  // Everything else → return as-is (static assets, etc.)
  return src;
}
