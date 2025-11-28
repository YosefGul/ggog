#!/usr/bin/env tsx
/**
 * Test 4: Input Validation
 * Tests Zod validation schemas
 */

import {
  emailSchema,
  passwordSchema,
  contactFormSchema,
  memberApplicationSchema,
  createUserSchema,
} from "../lib/validation";

console.log("🧪 Test 4: Input Validation\n");

let passed = 0;
let failed = 0;

// Test 4.1: Email validation
console.log("Test 4.1: Email validation");
try {
  const validEmails = ["test@example.com", "user.name@domain.co.uk"];
  const invalidEmails = ["not-an-email", "@domain.com", "user@", "user@domain"];

  const validPassed = validEmails.every(email => emailSchema.safeParse(email).success);
  const invalidPassed = invalidEmails.every(email => !emailSchema.safeParse(email).success);

  if (validPassed && invalidPassed) {
    console.log("✅ Test 4.1: Email validation works correctly");
    passed++;
  } else {
    console.log(`❌ Test 4.1: Failed - Valid: ${validPassed}, Invalid: ${invalidPassed}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 4.1: Error - ${error}`);
  failed++;
}

// Test 4.2: Contact form validation
console.log("\nTest 4.2: Contact form validation");
try {
  const validForm = {
    name: "John Doe",
    email: "john@example.com",
    message: "Test message",
  };

  const invalidForm = {
    name: "",
    email: "invalid-email",
    message: "",
  };

  const validResult = contactFormSchema.safeParse(validForm);
  const invalidResult = contactFormSchema.safeParse(invalidForm);

  if (validResult.success && !invalidResult.success) {
    console.log("✅ Test 4.2: Contact form validation works correctly");
    passed++;
  } else {
    console.log(`❌ Test 4.2: Failed - Valid: ${validResult.success}, Invalid: ${invalidResult.success}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 4.2: Error - ${error}`);
  failed++;
}

// Test 4.3: Member application validation
console.log("\nTest 4.3: Member application validation");
try {
  const validApplication = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    country: "Türkiye",
  };

  const invalidApplication = {
    firstName: "",
    lastName: "",
    email: "invalid",
    phone: "",
  };

  const validResult = memberApplicationSchema.safeParse(validApplication);
  const invalidResult = memberApplicationSchema.safeParse(invalidApplication);

  if (validResult.success && !invalidResult.success) {
    console.log("✅ Test 4.3: Member application validation works correctly");
    passed++;
  } else {
    console.log(`❌ Test 4.3: Failed - Valid: ${validResult.success}, Invalid: ${invalidResult.success}`);
    if (!validResult.success) {
      console.log(`   Errors: ${JSON.stringify(validResult.error.errors)}`);
    }
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 4.3: Error - ${error}`);
  failed++;
}

// Test 4.4: User creation validation
console.log("\nTest 4.4: User creation validation");
try {
  const validUser = {
    email: "admin@example.com",
    password: "ValidPass123!",
    name: "Admin User",
    role: "ADMIN" as const,
  };

  const invalidUser = {
    email: "invalid-email",
    password: "weak",
    role: "INVALID_ROLE" as any,
  };

  const validResult = createUserSchema.safeParse(validUser);
  const invalidResult = createUserSchema.safeParse(invalidUser);

  if (validResult.success && !invalidResult.success) {
    console.log("✅ Test 4.4: User creation validation works correctly");
    passed++;
  } else {
    console.log(`❌ Test 4.4: Failed - Valid: ${validResult.success}, Invalid: ${invalidResult.success}`);
    if (!validResult.success) {
      console.log(`   Errors: ${JSON.stringify(validResult.error.errors)}`);
    }
    failed++;
  }
} catch (error) {
  console.log(`❌ Test 4.4: Error - ${error}`);
  failed++;
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

