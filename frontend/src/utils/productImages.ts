import { Product } from '../types';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Convert a relative image path to a full URL
 */
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize the path - handle both filename and path formats
  let normalizedPath = imagePath.trim();
  
  // Remove leading slash if present
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  
  // Remove "uploads/" prefix if present (handles old data format)
  // Check for both "uploads/" and "/uploads/" patterns
  normalizedPath = normalizedPath.replace(/^\/?uploads\//i, '');
  
  // Build the final URL - normalizedPath should now be just the filename
  const finalUrl = `${BACKEND_URL}/uploads/${normalizedPath}`;
  return finalUrl;
};

/**
 * Get the first image from a product's images array
 * For backward compatibility with old products that might have single image
 */
export const getProductImage = (product: Product): string | null => {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }
  // Handle legacy products with single image field (if any)
  return null;
};

/**
 * Get all images from a product
 */
export const getProductImages = (product: Product): string[] => {
  if (product.images && Array.isArray(product.images)) {
    return product.images.map(img => getImageUrl(img) || '').filter(Boolean) as string[];
  }
  return [];
};
