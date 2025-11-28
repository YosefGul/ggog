#!/usr/bin/env tsx
/**
 * Test 6: XSS Protection
 * Tests XSS protection in rich text rendering
 */

import { sanitizeHtml, containsDangerousHtml } from "../lib/xss";

console.log("🧪 Test 6: XSS Protection\n");

let passed = 0;
let failed = 0;

const testCases = [
  {
    name: "Test 6.1: Script tag removal",
    html: '<p>Hello</p><script>alert("XSS")</script><p>World</p>',
    shouldContainScript: false,
  },
  {
    name: "Test 6.2: Event handler removal",
    html: '<p onclick="alert(\'XSS\')">Click me</p>',
    shouldContainHandler: false,
  },
  {
    name: "Test 6.3: JavaScript protocol removal",
    html: '<a href="javascript:alert(\'XSS\')">Link</a>',
    shouldContainProtocol: false,
  },
  {
    name: "Test 6.4: iframe removal",
    html: '<p>Content</p><iframe src="evil.com"></iframe>',
    shouldContainIframe: false,
  },
  {
    name: "Test 6.5: Safe HTML preservation",
    html: '<p>Safe <strong>content</strong> with <em>formatting</em></p>',
    shouldBeSafe: true,
  },
];

for (const testCase of testCases) {
  try {
    const sanitized = sanitizeHtml(testCase.html);
    const isDangerous = containsDangerousHtml(sanitized);

    let testPassed = false;

    if (testCase.name.includes("Script")) {
      testPassed = !sanitized.includes("<script");
    } else if (testCase.name.includes("handler")) {
      testPassed = !sanitized.match(/on\w+\s*=/i);
    } else if (testCase.name.includes("protocol")) {
      testPassed = !sanitized.includes("javascript:");
    } else if (testCase.name.includes("iframe")) {
      testPassed = !sanitized.includes("<iframe");
    } else if (testCase.name.includes("Safe")) {
      testPassed = !isDangerous && sanitized.includes("Safe");
    }

    if (testPassed) {
      console.log(`✅ ${testCase.name}: Passed`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: Failed`);
      console.log(`   Original: ${testCase.html.substring(0, 50)}...`);
      console.log(`   Sanitized: ${sanitized.substring(0, 50)}...`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: Error - ${error}`);
    failed++;
  }
}

// Test dangerous HTML detection
console.log("\nTest 6.6: Dangerous HTML detection");
try {
  const dangerousHtml = '<script>alert("XSS")</script>';
  const safeHtml = '<p>Safe content</p>';
  
  const dangerousDetected = containsDangerousHtml(dangerousHtml);
  const safeDetected = containsDangerousHtml(safeHtml);

  if (dangerousDetected && !safeDetected) {
    console.log("✅ Test 6.6: Dangerous HTML detection works correctly");
    passed++;
  } else {
    console.log(`❌ Test 6.6: Detection failed - Dangerous: ${dangerousDetected}, Safe: ${safeDetected}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 6.6: Error - ${error}`);
  failed++;
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

