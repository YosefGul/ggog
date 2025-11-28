import { NextResponse } from "next/server";
import { logger } from "./logger";
import { Prisma } from "@prisma/client";

/**
 * Custom error types
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse {
  // Log error
  if (error instanceof AppError) {
    logger.error("Application error", {
      statusCode: error.statusCode,
      message: error.message,
      isOperational: error.isOperational,
    });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error("Database error", {
      code: error.code,
      meta: error.meta,
    });
  } else if (error instanceof Error) {
    logger.error("Unexpected error", {
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error("Unknown error", { error });
  }

  // Return appropriate response
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Don't leak database structure information
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with this value already exists" },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
  }

  // Generic error response
  const isDevelopment = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      error: isDevelopment
        ? error instanceof Error
          ? error.message
          : "An unexpected error occurred"
        : "An error occurred. Please try again later.",
    },
    { status: 500 }
  );
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

