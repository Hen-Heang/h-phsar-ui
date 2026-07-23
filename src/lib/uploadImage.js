import { apiPost } from "@/utils/api";

/**
 * Upload an image file to the backend and return the public URL.
 * Backend must expose: POST /api/v1/files/upload
 * accepting multipart/form-data with a field named "file",
 * returning { data: { url: "..." } } or { url: "..." }.
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost("/api/v1/files/upload", { body: formData });
  if (!res.ok) throw new Error("Image upload failed");
  return res.data?.data;
}
