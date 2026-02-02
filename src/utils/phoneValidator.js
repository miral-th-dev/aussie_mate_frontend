// Phone number validation utilities
export const PHONE_REGEX_PATTERNS = {
  // Australian mobile numbers
  AU_MOBILE: /^04[\d\s\-]{8}$/,
  // International format
  INTERNATIONAL: /^\+61[\d\s\-]{8,15}$/,
  // General phone patterns
  GENERAL: /(\+?[\d\s\-\(\)]{8,15})|(\d{10,15})/g,
  // Combined pattern for detection
  COMBINED: /(\+?[\d\s\-\(\)]{8,15})|(\d{10,15})|(\+61[\d\s\-]{8,15})|(04[\d\s\-]{8})/g
};

/**
 * Check if a string contains phone numbers
 * @param {string} text - Text to check
 * @returns {boolean} - True if phone numbers are found
 */
export const containsPhoneNumber = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  return PHONE_REGEX_PATTERNS.COMBINED.test(text);
};

/**
 * Extract phone numbers from text
 * @param {string} text - Text to extract from
 * @returns {Array} - Array of found phone numbers
 */
export const extractPhoneNumbers = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const matches = text.match(PHONE_REGEX_PATTERNS.COMBINED);
  return matches || [];
};

/**
 * Replace phone numbers with placeholder text
 * @param {string} text - Text to process
 * @param {string} placeholder - Text to replace phone numbers with
 * @returns {string} - Text with phone numbers replaced
 */
export const replacePhoneNumbers = (text, placeholder = '[Phone number removed]') => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  return text.replace(PHONE_REGEX_PATTERNS.COMBINED, placeholder);
};

/**
 * Validate if text is safe to send (no phone numbers)
 * @param {string} text - Text to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateMessageForPhoneNumbers = (text) => {
  if (containsPhoneNumber(text)) {
    return {
      isValid: false,
      message: 'Phone numbers are not allowed in chat messages. Please contact through the platform.'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Format phone number for display (Australian format)
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Australian mobile format
  if (cleaned.length === 10 && cleaned.startsWith('04')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // International format
  if (cleaned.length === 11 && cleaned.startsWith('61')) {
    const withoutCountryCode = cleaned.substring(2);
    return `+61 ${withoutCountryCode.substring(0, 4)} ${withoutCountryCode.substring(4, 7)} ${withoutCountryCode.substring(7)}`;
  }
  
  return phone;
};

/**
 * Check if a phone number is valid Australian format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Australian phone number
 */
export const isValidAustralianPhone = (phone) => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Australian mobile (04XX XXX XXX)
  if (cleaned.length === 10 && cleaned.startsWith('04')) {
    return true;
  }
  
  // International format (+61 4XX XXX XXX)
  if (cleaned.length === 11 && cleaned.startsWith('614')) {
    return true;
  }
  
  return false;
};
