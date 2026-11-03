import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import { getUserAddress, saveUserAddress, getShortAddress, UserAddress } from '../../utils/location';
import MapPicker from '../MapPicker';

const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userAddress, setUserAddress] = useState<UserAddress | null>(getUserAddress());
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [addressForm, setAddressForm] = useState<UserAddress>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    // Check if user has address, if not show modal on first visit
    const address = getUserAddress();
    if (!address) {
      // Don't auto-show modal, let user click to set it
      setUserAddress(null);
    } else {
      setUserAddress(address);
    }
  }, []);

  const handleLogout = () => {
    // Clear address when logging out
    localStorage.removeItem('user_address');
    setUserAddress(null);
    dispatch(logout());
  };

  const handleAddressClick = () => {
    const existingAddress = getUserAddress();
    if (existingAddress) {
      setAddressForm(existingAddress);
    }
    setShowAddressModal(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressForm.city || addressForm.address) {
      saveUserAddress(addressForm);
      setUserAddress(addressForm);
      setShowAddressModal(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Set coordinates and show map picker
      setSelectedCoordinates({ lat: latitude, lng: longitude });
      setShowMapPicker(true);
      setIsGettingLocation(false);
      
    } catch (error: any) {
      console.error('Geolocation error:', error);
      setIsGettingLocation(false);
      let errorMessage = 'Could not get your location. ';
      
      if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
      } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information unavailable. Please check your device location settings.';
      } else if (error.code === 3 || error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setSelectedCoordinates({ lat, lng });
    
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ECommerce-App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.address) {
          const addr = data.address;
          setAddressForm({
            address: addr.road || addr.house_number || addr.house || addr.address29 || '',
            city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
            state: addr.state || addr.region || '',
            zipCode: addr.postcode || '',
            country: addr.country || 'India',
          });
        }
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      {/* Top bar - Amazon style dark header */}
      <nav className="bg-amazon-dark sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Address */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center text-amazon-orange hover:opacity-90 transition">
                <span className="text-2xl font-bold">amazon</span>
              </Link>
              
              {/* Deliver To Address */}
              <button
                onClick={handleAddressClick}
                className="flex items-start gap-1 px-3 py-1.5 hover:border border-white border-transparent rounded cursor-pointer text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 leading-tight">Deliver to</span>
                  <span className="text-sm font-semibold text-white leading-tight whitespace-nowrap">
                    {getShortAddress(userAddress)}
                  </span>
                </div>
                <svg className="w-4 h-4 mt-1 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-3xl mx-8">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 rounded-l-md border-0 focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-amazon-orange hover:bg-orange-600 text-white px-6 py-2 rounded-r-md transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right side items */}
            <div className="flex items-center gap-6 text-white text-sm">
              {isAuthenticated ? (
                <>
                  <div className="flex flex-col cursor-pointer hover:opacity-90">
                    <span className="text-xs text-gray-300">Hello, {user?.name}</span>
                    <Link to="/profile" className="font-semibold">
                      Account & Lists
                    </Link>
                  </div>
                  <Link to="/orders" className="flex flex-col hover:opacity-90">
                    <span className="text-xs text-gray-300">Returns</span>
                    <span className="font-semibold">& Orders</span>
                  </Link>
                  <Link to="/cart" className="relative flex items-center hover:opacity-90">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">🛒</span>
                      <span className="font-semibold">Cart</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-amazon-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin/products" className="hover:opacity-90 font-semibold">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hover:opacity-90 font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex flex-col hover:opacity-90">
                    <span className="text-xs text-gray-300">Hello, sign in</span>
                    <span className="font-semibold">Account & Lists</span>
                  </Link>
                  <Link to="/cart" className="relative flex items-center hover:opacity-90">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">🛒</span>
                      <span className="font-semibold">Cart</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-amazon-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary navigation bar */}
      <div className="bg-amazon-darker text-white text-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-10">
            <Link to="/" className="flex items-center gap-1 px-2 py-1 hover:border border-white border-transparent">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              All
            </Link>
            <Link to="/products" className="px-2 py-1 hover:border border-white border-transparent">
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="px-2 py-1 hover:border border-white border-transparent">
                  Orders
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && selectedCoordinates && (
        <MapPicker
          latitude={selectedCoordinates.lat}
          longitude={selectedCoordinates.lng}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => {
            setShowMapPicker(false);
          }}
        />
      )}

      {/* Address Modal */}
      {showAddressModal && !showMapPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Your Location</h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amazon-orange text-white rounded-md hover:bg-orange-600 transition font-medium"
                >
                  Save Address
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                We'll use this address for delivery estimates. You can change it anytime.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
