import { mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Magic bytes (file signatures) for image types
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // WebP starts with RIFF, but we need more checks
};

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/**
 * Maximum file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate file by checking magic bytes
 */
export function validateFileSignature(buffer: Buffer, expectedMimeType: string): boolean {
  const signatures = MAGIC_BYTES[expectedMimeType];
  if (!signatures) return false;

  // Special handling for WebP (needs more bytes to verify)
  if (expectedMimeType === "image/webp") {
    // WebP files start with RIFF and contain WEBP
    const hasRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    if (!hasRiff) return false;
    // Check for WEBP string at offset 8
    const webpString = buffer.slice(8, 12).toString("ascii");
    return webpString === "WEBP";
  }

  // Check each possible signature
  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
}

/**
 * Sanitize filename to prevent path traversal and other security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[\/\\]/g, "") // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/^\.+|\.+$/g, ""); // Remove leading/trailing dots

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split(".").pop();
    sanitized = sanitized.substring(0, 255 - (ext?.length || 0) - 1) + "." + ext;
  }

  return sanitized;
}

/**
 * Get file extension from filename (safely)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  const ext = parts[parts.length - 1].toLowerCase();
  // Only allow alphanumeric extensions
  return /^[a-z0-9]+$/.test(ext) ? ext : "";
}

/**
 * Ensure upload directory exists, create if it doesn't
 */
export async function ensureUploadDirectory(uploadDir: string): Promise<void> {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
}

/**
 * Generate a safe filename
 */
export function generateSafeFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalFilename) || "jpg";
  return `${timestamp}-${randomString}.${extension}`;
}

