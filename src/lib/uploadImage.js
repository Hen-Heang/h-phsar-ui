import { apiPost } from "@/utils/api";

/**
 * Value for the `accept` attribute of any file input feeding uploadImage().
 * Mirrors the backend allowlist (ImageContentType) so the picker offers exactly
 * what the server will store. This is UX, not enforcement — the browser lets a
 * determined user past `accept`, which is why the server sniffs the bytes.
 */
export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/gif,image/webp";

/**
 * Upload an image file to the backend and return the public URL.
 * Backend must expose: POST /api/v1/files/upload
 * accepting multipart/form-data with a field named "file",
 * returning { data: { url: "..." } } or { url: "..." }.
 *
 * Upload requires a token (the endpoint used to be anonymous); the returned URL
 * stays publicly readable so it can be used directly as an <img> src. Every
 * caller is already inside an authenticated supplier/buyer screen, so the
 * in-memory access token is present by the time this runs.
 *
 * The backend accepts PNG, JPEG, GIF, and WebP only, and decides the type from
 * the file's actual bytes rather than its name or the browser's declared type —
 * so a renamed non-image is rejected here with a 400 rather than stored.
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost("/api/v1/files/upload", {
    body: formData,
  });
  if (!res.ok) {
    throw new Error(res.data?.detail ?? "Image upload failed");
  }
  return res.data?.data;
}
