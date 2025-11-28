import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getCurrentUser } from "@/lib/auth";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  validateFileSignature,
  generateSafeFilename,
  ensureUploadDirectory,
} from "@/lib/file-upload";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type (MIME type check)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file signature (magic bytes) to prevent MIME type spoofing
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. File content does not match declared type." },
        { status: 400 }
      );
    }

    // Generate safe filename (prevents path traversal)
    const filename = generateSafeFilename(file.name);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await ensureUploadDirectory(uploadDir);

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL path
    const url = `/uploads/${filename}`;

    logger.info("File uploaded successfully", { filename, userId: (user as any).id });

    return NextResponse.json({ url, filename });
  } catch (error) {
    logger.error("Upload error", { error });
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}



