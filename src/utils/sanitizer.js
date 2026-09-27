import DOMPurify from 'dompurify';

/**
 * Sanitizes user input against Cross-Site Scripting (XSS) injection.
 * Strips executable scripts, event handlers, and dangerous URI schemes.
 * 
 * @param {string} input - Raw user input string
 * @returns {string} Sanitized string safe for state storage and rendering
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Initial defensive regex pass to strip common malicious patterns
  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/onerror\s*=\s*["']?[^"'>]+["']?/gi, '')
    .replace(/onload\s*=\s*["']?[^"'>]+["']?/gi, '')
    .replace(/javascript\s*:/gi, '');

  // 2. Browser/JSDOM DOMPurify pass if window is defined
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    cleaned = DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: [], // Strip all HTML tags from plain text inputs
      ALLOWED_ATTR: [],
    });
  } else {
    // Basic HTML tag stripper fallback for pure node environments
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  }

  return cleaned.trim();
}
