/**
 * XSS Protection utilities
 * For HTML sanitization in rich text content
 */

/**
 * Basic HTML sanitization (for simple cases)
 * For production, consider using DOMPurify library
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  
  // Remove object tags
  html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  
  // Remove embed tags
  html = html.replace(/<embed\b[^>]*>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  html = html.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: protocol
  html = html.replace(/javascript:/gi, "");
  
  // Remove data: URLs in img/src (can be used for XSS)
  html = html.replace(/src\s*=\s*["']data:/gi, 'src=""');
  
  return html;
}

/**
 * Check if string contains potentially dangerous HTML
 */
export function containsDangerousHtml(html: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(html));
}

