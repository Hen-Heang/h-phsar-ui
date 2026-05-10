"use client";

import { useState } from "react";
import { isInvalidImageSrc } from "@/lib/images";

// SVG icon paths per type
const CONFIGS = {
  product: {
    bg: "#EFF6FF",
    iconColor: "#3B82F6",
    label: "Product",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
      </g>
    ),
  },
  store: {
    bg: "#EEF2FF",
    iconColor: "#6366F1",
    label: "Store",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1-6h16l1 6" />
        <path d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
        <path d="M5 9v11h14V9" />
        <rect x="9" y="14" width="6" height="6" />
      </g>
    ),
  },
  banner: {
    bg: "#F0FDF4",
    iconColor: "#22C55E",
    label: "Banner",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </g>
    ),
  },
  avatar: {
    bg: "#F8FAFC",
    iconColor: "#94A3B8",
    label: "User",
    icon: (
      <g fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </g>
    ),
  },
  category: {
    bg: "#FFF7ED",
    iconColor: "#F97316",
    label: "Category",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </g>
    ),
  },
  notification: {
    bg: "#FFFBEB",
    iconColor: "#F59E0B",
    label: "Notification",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </g>
    ),
  },
};

function PlaceholderSVG({ type = "product", className, style, width, height }) {
  const config = CONFIGS[type] ?? CONFIGS.product;
  return (
    <span
      role="img"
      aria-label={config.label}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: config.bg,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
        width: width ?? "100%",
        height: height ?? "100%",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="40%"
        height="40%"
        color={config.iconColor}
        xmlns="http://www.w3.org/2000/svg"
        style={{ minWidth: 16, minHeight: 16 }}
      >
        {config.icon}
      </svg>
    </span>
  );
}

/**
 * Drop-in replacement for <img> with automatic type-aware placeholder.
 *
 * Usage:
 *   <PlaceholderImage src={product.image} type="product" className="w-16 h-16 rounded-lg" />
 *   <PlaceholderImage src={store.banner} type="banner" className="w-full h-40 object-cover" />
 *   <PlaceholderImage src={user.avatar} type="avatar" className="w-10 h-10 rounded-full" />
 *
 * Props:
 *   type     — 'product' | 'store' | 'banner' | 'avatar' | 'category' | 'notification'
 *   src      — actual image url (optional)
 *   alt      — alt text
 *   className, style, width, height — passed through to <img> or the SVG wrapper
 */
export default function PlaceholderImage({
  type = "product",
  src,
  alt = "",
  className,
  style,
  width,
  height,
  ...rest
}) {
  const [errored, setErrored] = useState(false);

  if (errored || isInvalidImageSrc(src)) {
    return (
      <PlaceholderSVG
        type={type}
        className={className}
        style={style}
        width={width}
        height={height}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}

export { PlaceholderSVG };
