import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "image/svg+xml": "svg", "image/x-icon": "ico",
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an image to Supabase Storage (production) or /public/uploads (local dev).
 * Returns a public URL.
 */
export async function uploadImage(file: File, folder = "media") {
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("Please upload a JPG, PNG, WebP, AVIF, GIF, SVG or ICO image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "media";
  const name = `${safeFolder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "media";

  if (url && key) {
    const res = await fetch(`${url}/storage/v1/object/${bucket}/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "false", "cache-control": "31536000" },
      body: bytes,
    });
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
    return `${url}/storage/v1/object/public/${bucket}/${name}`;
  }

  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_UPLOADS) {
    throw new Error("Cloud storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  return `/uploads/${name}`;
}
