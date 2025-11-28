#!/usr/bin/env tsx
/**
 * Test 5: Password Policy
 * Tests password validation and policy enforcement
 */

import { validatePassword, passwordSchema } from "../lib/password";

console.log("🧪 Test 5: Password Policy\n");

let passed = 0;
let failed = 0;

const testCases = [
  {
    name: "Test 5.1: Minimum 8 characters",
    password: "Short1!",
    shouldPass: false,
    reason: "Too short",
  },
  {
    name: "Test 5.2: Missing uppercase",
    password: "lowercase123!",
    shouldPass: false,
    reason: "No uppercase letter",
  },
  {
    name: "Test 5.3: Missing lowercase",
    password: "UPPERCASE123!",
    shouldPass: false,
    reason: "No lowercase letter",
  },
  {
    name: "Test 5.4: Missing number",
    password: "NoNumber!",
    shouldPass: false,
    reason: "No number",
  },
  {
    name: "Test 5.5: Missing special character",
    password: "NoSpecial123",
    shouldPass: false,
    reason: "No special character",
  },
  {
    name: "Test 5.6: Valid password",
    password: "ValidPass123!",
    shouldPass: true,
    reason: "Meets all requirements",
  },
  {
    name: "Test 5.7: Strong password",
    password: "VeryStrongPassword123!@#",
    shouldPass: true,
    reason: "Strong password",
  },
];

for (const testCase of testCases) {
  try {
    // Test with validatePassword function
    const result = validatePassword(testCase.password);
    const zodResult = passwordSchema.safeParse(testCase.password);

    const functionPassed = result.valid === testCase.shouldPass;
    const zodPassed = zodResult.success === testCase.shouldPass;

    if (functionPassed && zodPassed) {
      console.log(`✅ ${testCase.name}: Passed (${testCase.reason})`);
      if (!result.valid) {
        console.log(`   Errors: ${result.errors.join(", ")}`);
      }
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: Failed`);
      console.log(`   Expected: ${testCase.shouldPass ? "pass" : "fail"}`);
      console.log(`   Function result: ${result.valid ? "pass" : "fail"}`);
      console.log(`   Zod result: ${zodResult.success ? "pass" : "fail"}`);
      if (!result.valid) {
        console.log(`   Errors: ${result.errors.join(", ")}`);
      }
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: Error - ${error}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

