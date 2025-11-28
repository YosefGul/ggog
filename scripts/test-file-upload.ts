#!/usr/bin/env tsx
/**
 * Test 2: File Upload Security
 * Tests file upload security features
 */

import { validateFileSignature, sanitizeFilename, getFileExtension, ALLOWED_MIME_TYPES } from "../lib/file-upload";
import { readFileSync } from "fs";
import { join } from "path";

console.log("🧪 Test 2: File Upload Security\n");

let passed = 0;
let failed = 0;

// Test 2.1: Valid image file signatures
console.log("Test 2.1: Valid image file signatures");
try {
  // Create mock buffers for different image types
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

  const jpegValid = validateFileSignature(jpegBuffer, "image/jpeg");
  const pngValid = validateFileSignature(pngBuffer, "image/png");
  const gifValid = validateFileSignature(gifBuffer, "image/gif");

  if (jpegValid && pngValid && gifValid) {
    console.log("✅ Test 2.1: Passed");
    passed++;
  } else {
    console.log(`❌ Test 2.1: Failed - JPEG: ${jpegValid}, PNG: ${pngValid}, GIF: ${gifValid}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 2.1: Error - ${error}`);
  failed++;
}

// Test 2.2: MIME type spoofing detection
console.log("\nTest 2.2: MIME type spoofing detection");
try {
  const fakeJpegBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG signature but declared as JPEG
  const isValid = validateFileSignature(fakeJpegBuffer, "image/jpeg");
  
  if (!isValid) {
    console.log("✅ Test 2.2: Correctly detected spoofed MIME type");
    passed++;
  } else {
    console.log("❌ Test 2.2: Failed to detect spoofed MIME type");
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 2.2: Error - ${error}`);
  failed++;
}

// Test 2.3: Filename sanitization
console.log("\nTest 2.3: Filename sanitization");
try {
  const dangerousNames = [
    "../../../etc/passwd",
    "file<script>.jpg",
    "file with spaces.jpg",
    "file..jpg",
    "normal-file.jpg",
  ];

  const sanitized = dangerousNames.map(sanitizeFilename);
  const allSafe = sanitized.every(name => !name.includes("../") && !name.includes("<") && !name.includes(" "));

  if (allSafe) {
    console.log("✅ Test 2.3: All filenames sanitized correctly");
    console.log(`   Examples: ${sanitized.slice(0, 3).join(", ")}`);
    passed++;
  } else {
    console.log("❌ Test 2.3: Some filenames not properly sanitized");
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 2.3: Error - ${error}`);
  failed++;
}

// Test 2.4: File extension extraction
console.log("\nTest 2.4: File extension extraction");
try {
  const testCases = [
    { filename: "image.jpg", expected: "jpg" },
    { filename: "image.PNG", expected: "png" },
    { filename: "file.name.gif", expected: "gif" },
    { filename: "noextension", expected: "" },
    { filename: "file.js.exe", expected: "exe" },
  ];

  const allPassed = testCases.every(({ filename, expected }) => {
    const ext = getFileExtension(filename);
    return ext.toLowerCase() === expected.toLowerCase();
  });

  if (allPassed) {
    console.log("✅ Test 2.4: File extension extraction works correctly");
    passed++;
  } else {
    console.log("❌ Test 2.4: File extension extraction failed");
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 2.4: Error - ${error}`);
  failed++;
}

// Test 2.5: Allowed MIME types
console.log("\nTest 2.5: Allowed MIME types");
try {
  const expectedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allPresent = expectedTypes.every(type => ALLOWED_MIME_TYPES.includes(type));
  
  if (allPresent && ALLOWED_MIME_TYPES.length === expectedTypes.length) {
    console.log("✅ Test 2.5: Allowed MIME types are correct");
    passed++;
  } else {
    console.log(`❌ Test 2.5: MIME types mismatch. Expected: ${expectedTypes.join(", ")}, Got: ${ALLOWED_MIME_TYPES.join(", ")}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 2.5: Error - ${error}`);
  failed++;
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

