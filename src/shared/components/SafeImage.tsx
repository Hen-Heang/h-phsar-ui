"use client";

import React from "react";
import noImage from "@/assets/images/no_image.jpg";

interface SafeImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallback?: any;
}

/**
 * A safe image component that handles broken links and fallback images.
 * @param {string} src - The image source URL.
 * @param {string} fallback - Optional fallback image if src fails.
 * @param {string} className - Tailwind classes.
 * @param {string} alt - Alt text for the image.
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallback = noImage,
  className = "",
  alt = "image",
  ...props
}) => {
  const getSafeSrc = (source: string | null | undefined): string | any => {
    if (!source || source === "null" || source === "undefined") return fallback;
    if (
      typeof source === "string" &&
      (source.startsWith("http") ||
        source.startsWith("/") ||
        source.startsWith("data:"))
    ) {
      return source;
    }
    return fallback;
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = fallback?.src || fallback;
  };

  return (
    <img
      src={getSafeSrc(src)}
      onError={handleError}
      className={className}
      alt={alt}
      {...props}
    />
  );
};

export default SafeImage;
