#!/usr/bin/env tsx
/**
 * Test 12: Date Utility Functions
 * Tests date handling and formatting utilities
 */

import { formatDate, formatDateTime, parseDate, isPastDate, isFutureDate, toISOString } from "../lib/date";

console.log("🧪 Test 12: Date Utility Functions\n");

let passed = 0;
let failed = 0;

// Test 12.1: Date formatting (Turkish locale)
console.log("Test 12.1: Date formatting");
try {
  const testDate = new Date("2024-01-15T10:30:00Z");
  const formatted = formatDate(testDate);
  const formattedDateTime = formatDateTime(testDate);

  if (formatted && formattedDateTime && formatted.includes("2024")) {
    console.log(`✅ Test 12.1: Passed - Formatted: ${formatted}`);
    passed++;
  } else {
    console.log(`❌ Test 12.1: Failed - Formatted: ${formatted}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 12.1: Error - ${error}`);
  failed++;
}

// Test 12.2: Invalid date handling
console.log("\nTest 12.2: Invalid date handling");
try {
  const invalidDate = parseDate("invalid-date");
  const nullDate = parseDate(null);
  const undefinedDate = parseDate(undefined);

  if (invalidDate === null && nullDate === null && undefinedDate === null) {
    console.log("✅ Test 12.2: Invalid dates handled correctly");
    passed++;
  } else {
    console.log(`❌ Test 12.2: Failed - Invalid: ${invalidDate}, Null: ${nullDate}, Undefined: ${undefinedDate}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 12.2: Error - ${error}`);
  failed++;
}

// Test 12.3: Past date detection
console.log("\nTest 12.3: Past date detection");
try {
  const pastDate = new Date("2020-01-01");
  const futureDate = new Date("2030-01-01");
  const now = new Date();

  const pastDetected = isPastDate(pastDate);
  const futureDetected = isFutureDate(futureDate);
  const nowIsPast = isPastDate(now);
  const nowIsFuture = isFutureDate(now);

  if (pastDetected && futureDetected && !nowIsPast && !nowIsFuture) {
    console.log("✅ Test 12.3: Past/future date detection works correctly");
    passed++;
  } else {
    console.log(`❌ Test 12.3: Failed - Past: ${pastDetected}, Future: ${futureDetected}, Now past: ${nowIsPast}, Now future: ${nowIsFuture}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 12.3: Error - ${error}`);
  failed++;
}

// Test 12.4: ISO string conversion
console.log("\nTest 12.4: ISO string conversion");
try {
  const date = new Date("2024-01-15T10:30:00Z");
  const iso = toISOString(date);
  const nullIso = toISOString(null);
  const invalidIso = toISOString(new Date("invalid"));

  if (iso && iso.includes("2024") && nullIso === null && invalidIso === null) {
    console.log(`✅ Test 12.4: ISO conversion works correctly - ${iso}`);
    passed++;
  } else {
    console.log(`❌ Test 12.4: Failed - ISO: ${iso}, Null: ${nullIso}, Invalid: ${invalidIso}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 12.4: Error - ${error}`);
  failed++;
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

