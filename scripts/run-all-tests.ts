#!/usr/bin/env tsx
/**
 * Run all test scripts
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

console.log("🚀 Running All Tests\n");
console.log("=" .repeat(50));

const tests = [
  { name: "Environment Variables Validation", script: "test-env-validation.ts" },
  { name: "File Upload Security", script: "test-file-upload.ts" },
  { name: "Password Policy", script: "test-password-policy.ts" },
  { name: "XSS Protection", script: "test-xss-protection.ts" },
  { name: "Input Validation", script: "test-validation.ts" },
  { name: "Date Utilities", script: "test-date-utils.ts" },
];

let totalPassed = 0;
let totalFailed = 0;

for (const test of tests) {
  const scriptPath = join(__dirname, test.script);
  
  if (!existsSync(scriptPath)) {
    console.log(`\n⚠️  ${test.name}: Script not found (${test.script})`);
    continue;
  }

  console.log(`\n📋 Running: ${test.name}`);
  console.log("-".repeat(50));

  try {
    execSync(`tsx ${scriptPath}`, {
      stdio: "inherit",
      cwd: __dirname,
    });
    totalPassed++;
  } catch (error: any) {
    if (error.status !== undefined) {
      totalFailed++;
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Final Results:`);
console.log(`   ✅ Passed: ${totalPassed}`);
console.log(`   ❌ Failed: ${totalFailed}`);
console.log(`   📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%\n`);

process.exit(totalFailed > 0 ? 1 : 0);

