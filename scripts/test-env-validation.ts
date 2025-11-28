#!/usr/bin/env tsx
/**
 * Test 1: Environment Variables Validation
 * Tests that environment variables are properly validated
 */

import { z } from "zod";

console.log("🧪 Test 1: Environment Variables Validation\n");

const testCases = [
  {
    name: "Test 1.1: Missing DATABASE_URL",
    env: {},
    shouldFail: true,
  },
  {
    name: "Test 1.2: Invalid DATABASE_URL format",
    env: { DATABASE_URL: "not-a-url" },
    shouldFail: true,
  },
  {
    name: "Test 1.3: Missing NEXTAUTH_SECRET",
    env: { DATABASE_URL: "postgresql://user:pass@localhost:5432/db" },
    shouldFail: true,
  },
  {
    name: "Test 1.4: Short NEXTAUTH_SECRET (< 32 chars)",
    env: {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      NEXTAUTH_SECRET: "short",
    },
    shouldFail: true,
  },
  {
    name: "Test 1.5: Valid environment variables",
    env: {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      NEXTAUTH_SECRET: "a".repeat(32),
      NEXTAUTH_URL: "http://localhost:3000",
    },
    shouldFail: false,
  },
];

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL").optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  try {
    // Temporarily set environment variables
    const originalEnv = { ...process.env };
    Object.assign(process.env, testCase.env);

    try {
      envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        REDIS_URL: process.env.REDIS_URL,
        NODE_ENV: process.env.NODE_ENV || "development",
      });

      if (testCase.shouldFail) {
        console.log(`❌ ${testCase.name}: Expected to fail but passed`);
        failed++;
      } else {
        console.log(`✅ ${testCase.name}: Passed`);
        passed++;
      }
    } catch (error) {
      if (testCase.shouldFail) {
        console.log(`✅ ${testCase.name}: Correctly failed with: ${error instanceof z.ZodError ? error.errors[0].message : error}`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}: Unexpectedly failed: ${error}`);
        failed++;
      }
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: Test error: ${error}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

