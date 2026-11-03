/**
 * Format price in INR (Indian Rupees)
 */
export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(2)}`;
};

/**
 * Format price with commas for better readability
 */
export const formatPriceWithCommas = (price: number): string => {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
