/**
 * Personalization utilities for tracking user interactions
 */

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_RECENT_VIEWS = 10;

export interface RecentlyViewedProduct {
  productId: string;
  viewedAt: number; // timestamp
}

/**
 * Add a product to recently viewed
 */
export const addToRecentlyViewed = (productId: string): void => {
  try {
    const recent = getRecentlyViewed();
    
    // Remove if already exists (to avoid duplicates)
    const filtered = recent.filter(item => item.productId !== productId);
    
    // Add to beginning
    const updated = [
      { productId, viewedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_RECENT_VIEWS); // Keep only last 10
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recently viewed:', error);
  }
};

/**
 * Get recently viewed product IDs
 */
export const getRecentlyViewed = (): RecentlyViewedProduct[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading recently viewed:', error);
  }
  return [];
};

/**
 * Clear recently viewed products
 */
export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Get user interaction data for recommendations
 */
export const getUserInteractionData = () => {
  try {
    const viewed = getRecentlyViewed();
    const cart = localStorage.getItem('cart_data'); // If cart is stored
    const orders = localStorage.getItem('orders_data'); // If orders are stored
    
    return {
      viewedProducts: viewed.map(v => v.productId),
      cartItems: cart ? JSON.parse(cart) : [],
      orders: orders ? JSON.parse(orders) : [],
    };
  } catch (error) {
    console.error('Error getting user interaction data:', error);
    return {
      viewedProducts: [],
      cartItems: [],
      orders: [],
    };
  }
};

/**
 * Get categories from viewed products for recommendations
 */
export const getPreferredCategories = (viewedProductIds: string[], allProducts: any[]): string[] => {
  const categoryCount: { [key: string]: number } = {};
  
  viewedProductIds.forEach(productId => {
    const product = allProducts.find(p => p.id === productId);
    if (product && product.category) {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    }
  });
  
  // Return top 3 categories
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
};
