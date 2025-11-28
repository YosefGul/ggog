/**
 * Logger utility for structured logging
 * Masks sensitive data in production
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Mask sensitive data in logs
 */
function maskSensitiveData(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const sensitiveKeys = ["password", "token", "secret", "authorization", "cookie"];
  const masked = { ...data };

  for (const key in masked) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      masked[key] = "***MASKED***";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}

/**
 * Format log message
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): void {
  if (isProduction && level === "debug") {
    return; // Don't log debug in production
  }

  const timestamp = new Date().toISOString();
  const contextData = context ? maskSensitiveData(context) : {};

  const logEntry = {
    timestamp,
    level,
    message,
    ...contextData,
  };

  // In production, use structured logging
  if (isProduction) {
    console.log(JSON.stringify(logEntry));
  } else {
    // In development, use formatted console methods
    const logMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logMethod(`[${timestamp}] [${level.toUpperCase()}] ${message}`, contextData);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => formatLog("info", message, context),
  warn: (message: string, context?: LogContext) => formatLog("warn", message, context),
  error: (message: string, context?: LogContext) => formatLog("error", message, context),
  debug: (message: string, context?: LogContext) => formatLog("debug", message, context),
};

