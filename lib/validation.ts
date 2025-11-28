import { z } from "zod";

/**
 * Common validation schemas
 */

export const emailSchema = z.string().email("Invalid email format");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

/**
 * ID parameter schema
 */
export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/**
 * User creation schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, "Name is required").optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR", "VIEWER"]).optional(),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(1, "Name is required").optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR", "VIEWER"]).optional(),
  password: passwordSchema.optional(),
});

/**
 * Event creation schema
 */
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  eventDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  eventType: z.string().optional().nullable(),
  participantLimit: z.coerce.number().int().positive().optional().nullable(),
  applicationDeadline: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  acceptsApplications: z.boolean().default(false),
  isPastEvent: z.boolean().default(false),
  driveLink: z.string().url().optional().nullable(),
  details: z.string().optional().nullable(),
  showOnHomepage: z.boolean().default(false),
  order: z.number().int().default(0),
  images: z.array(z.object({
    url: z.string().url(),
    order: z.number().int(),
  })).optional(),
});

/**
 * Announcement creation schema
 */
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url().optional().nullable(),
  link: z.string().url().optional().nullable(),
  linkTitle: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  publishedAt: z.string().datetime().optional().nullable(),
});

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  subject: z.string().optional().nullable(),
  message: z.string().min(1, "Message is required"),
});

/**
 * Newsletter subscription schema
 */
export const newsletterSchema = z.object({
  email: emailSchema,
});

/**
 * Event application schema
 */
export const eventApplicationSchema = z.object({
  formData: z.record(z.any()),
});

/**
 * Member application schema
 */
export const memberApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default("Türkiye"),
  occupation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  portfolio: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  motivation: z.string().optional().nullable(),
  expectations: z.string().optional().nullable(),
  gameDevelopmentExperience: z.string().optional().nullable(),
  preferredRole: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
});

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

