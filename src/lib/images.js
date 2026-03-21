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
  if (event?.currentTarget && event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
}
