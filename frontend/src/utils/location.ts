/**
 * Location/Address utilities
 */

export interface UserAddress {
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const ADDRESS_STORAGE_KEY = 'user_address';

/**
 * Get user address from localStorage
 */
export const getUserAddress = (): UserAddress | null => {
  try {
    const stored = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading address from localStorage:', error);
  }
  return null;
};

/**
 * Save user address to localStorage
 */
export const saveUserAddress = (address: UserAddress): void => {
  try {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address));
  } catch (error) {
    console.error('Error saving address to localStorage:', error);
  }
};

/**
 * Get formatted address string for display
 */
export const getFormattedAddress = (address: UserAddress | null): string => {
  if (!address) return 'Select your location';
  
  if (address.city) {
    return `${address.city}${address.state ? `, ${address.state}` : ''}${address.zipCode ? ` ${address.zipCode}` : ''}`;
  }
  return address.address || 'Select your location';
};

/**
 * Get short address for display (just city, state)
 */
export const getShortAddress = (address: UserAddress | null): string => {
  if (!address) return 'Select your location';
  
  if (address.city) {
    return address.state ? `${address.city}, ${address.state}` : address.city;
  }
  return address.address || 'Select your location';
};
