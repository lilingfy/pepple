/**
 * PII (Personally Identifiable Information) Redaction
 * Removes sensitive information from text before processing
 */

// Patterns for PII detection
const PII_PATTERNS = {
  // Chinese phone numbers
  phone: /1[3-9]\d{9}/g,
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Chinese ID numbers (18 digits)
  idCard: /\d{17}[\dXx]/g,
  // Bank card numbers (simplified)
  bankCard: /\d{16,19}/g,
  // WeChat IDs (simplified pattern)
  wechat: /微信[：:]\s*[a-zA-Z0-9_-]+/gi,
  // Addresses (simplified)
  address: /(地址|住址|家庭地址)[：:]\s*[^\n,，。]+/gi,
};

const REDACTION_TOKEN = '[REDACTED]';

export interface RedactionResult {
  redactedText: string;
  redactedCount: number;
  redactedTypes: string[];
}

/**
 * Redact sensitive information from text
 * @param text - Input text that may contain PII
 * @returns Redacted text with PII replaced by tokens
 */
export function redactSensitiveText(text: string): RedactionResult {
  let redactedText = text;
  const redactedTypes: string[] = [];
  let totalCount = 0;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = redactedText.match(pattern);
    if (matches && matches.length > 0) {
      redactedTypes.push(type);
      totalCount += matches.length;
      redactedText = redactedText.replace(pattern, REDACTION_TOKEN);
    }
  }

  return {
    redactedText,
    redactedCount: totalCount,
    redactedTypes: [...new Set(redactedTypes)],
  };
}

/**
 * Check if text contains any PII
 * @param text - Input text to check
 * @returns True if PII is detected
 */
export function containsPII(text: string): boolean {
  return Object.values(PII_PATTERNS).some(pattern => pattern.test(text));
}

/**
 * Get list of PII types found in text
 * @param text - Input text to analyze
 * @returns Array of PII type names found
 */
export function detectPIITypes(text: string): string[] {
  const types: string[] = [];
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      types.push(type);
    }
  }
  return types;
}
