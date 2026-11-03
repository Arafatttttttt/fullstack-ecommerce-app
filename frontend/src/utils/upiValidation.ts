// Common UPI handles/domains
const VALID_UPI_HANDLES = [
  // Bank-based
  'icici',
  'hdfcbank',
  'sbi',
  'axisbank',
  'kotak',
  'pnb',
  'bob',
  'unionbank',
  'canara',
  'indianbank',
  // App-based
  'paytm',
  'ybl',
  'ibl',
  'axl',
  'oksbi',
  'okaxis',
  'okhdfcbank',
  'okicici',
  'okkotak',
  'upi',
  'bhim',
];

/**
 * Validates UPI ID format
 * Format: username@bank_or_app_handle
 * Examples: rahul@icici, mobile@paytm, name@ybl
 */
export const validateUPI = (upiId: string): { isValid: boolean; error?: string } => {
  if (!upiId || upiId.trim() === '') {
    return { isValid: false, error: 'UPI ID is required' };
  }

  // Check if it contains @ symbol
  if (!upiId.includes('@')) {
    return { isValid: false, error: 'UPI ID must contain @ symbol (e.g., username@paytm)' };
  }

  // Split by @
  const parts = upiId.split('@');
  
  if (parts.length !== 2) {
    return { isValid: false, error: 'UPI ID must have exactly one @ symbol' };
  }

  const [username, handle] = parts;

  // Validate username part (before @)
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username part cannot be empty' };
  }

  // Username can contain alphanumeric, dots, hyphens, underscores
  const usernamePattern = /^[a-zA-Z0-9._-]+$/;
  if (!usernamePattern.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, dots, hyphens, and underscores' };
  }

  // Validate handle part (after @)
  if (!handle || handle.trim() === '') {
    return { isValid: false, error: 'Bank/App handle cannot be empty' };
  }

  // Handle should be lowercase for validation
  const handleLower = handle.toLowerCase();

  // Check if handle is in the list of valid handles
  if (!VALID_UPI_HANDLES.includes(handleLower)) {
    return { 
      isValid: false, 
      error: `Invalid UPI handle. Valid handles include: ${VALID_UPI_HANDLES.slice(0, 10).join(', ')}, etc.` 
    };
  }

  return { isValid: true };
};

/**
 * Formats UPI ID examples for display
 */
export const getUPIExamples = (): string[] => {
  return [
    'username@paytm',
    'name@ybl',
    'user@okhdfcbank',
    'mobile@oksbi',
    'rahul@icici',
    'ankit@hdfcbank',
    'pooja@sbi',
  ];
};
