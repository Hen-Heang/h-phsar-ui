export function isInvalidImageSrc(value) {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  return (
    normalized === "" ||
    normalized === "string" ||
    normalized === "undefined" ||
    normalized === "null"
  );
}

export function getSafeImageSrc(value, fallback) {
  return isInvalidImageSrc(value) ? fallback : value;
}

export function applyImageFallback(event, fallback) {
  if (event?.currentTarget && typeof fallback === "string") {
    event.currentTarget.onerror = null; // prevent infinite loop
    event.currentTarget.src = fallback;
  }
}

// SVG data-URL placeholders keyed by image type.
// Use with getSafeImageSrc / applyImageFallback for <img> tags that can't
// easily switch to <PlaceholderImage>.
//
// Example:
//   import { PLACEHOLDER_SRCS } from "@/lib/images";
//   <img src={product.image} onError={(e) => applyImageFallback(e, PLACEHOLDER_SRCS.product)} />
const makeSVG = (bgColor, iconColor, pathContent) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="${bgColor}"/>
      <g transform="translate(20,20)" stroke="${iconColor}" fill="${iconColor}" width="40" height="40">
        ${pathContent}
      </g>
    </svg>`
  )}`;

export const PLACEHOLDER_SRCS = {
  product: makeSVG(
    "#EFF6FF",
    "#3B82F6",
    `<g fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/>
    </g>`
  ),
  store: makeSVG(
    "#EEF2FF",
    "#6366F1",
    `<g fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 3h1l14 0 1 6"/>
      <path d="M1 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0"/>
      <path d="M3 9v11h14V9"/>
      <rect x="7" y="14" width="6" height="6"/>
    </g>`
  ),
  banner: makeSVG(
    "#F0FDF4",
    "#22C55E",
    `<g fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="22" height="16" rx="2"/>
      <path d="M1 9h22"/>
      <path d="M8 19V9"/>
    </g>`
  ),
  avatar: makeSVG(
    "#F8FAFC",
    "#94A3B8",
    `<g fill="#94A3B8">
      <circle cx="12" cy="8" r="5"/>
      <path d="M2 22c0-5 4.5-9 10-9s10 4 10 9"/>
    </g>`
  ),
  category: makeSVG(
    "#FFF7ED",
    "#F97316",
    `<g fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="9" height="9" rx="1"/>
      <rect x="14" y="1" width="9" height="9" rx="1"/>
      <rect x="1" y="14" width="9" height="9" rx="1"/>
      <rect x="14" y="14" width="9" height="9" rx="1"/>
    </g>`
  ),
  notification: makeSVG(
    "#FFFBEB",
    "#F59E0B",
    `<g fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </g>`
  ),
};
