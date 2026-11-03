import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/currency';
import { getProductImage } from '../utils/productImages';
import { renderFilledStars } from '../utils/rating';
import { productsAPI } from '../services/api';
import { getRecentlyViewed, getPreferredCategories } from '../utils/personalization';
import { Product } from '../types';
import { addToCart } from '../store/slices/cartSlice';
import ProductCardSkeleton from '../components/skeletons/ProductCardSkeleton';
import CompactProductCardSkeleton from '../components/skeletons/CompactProductCardSkeleton';

const Home = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const { cart } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch recently viewed products
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      const recentIds = getRecentlyViewed();
      if (recentIds.length === 0) return;

      setLoadingRecent(true);
      try {
        const productPromises = recentIds
          .slice(0, 6)
          .map(item => productsAPI.getProductById(item.productId));
        
        const responses = await Promise.all(productPromises);
        const products = responses
          .map(res => res.data)
          .filter(Boolean) as Product[];
        
        setRecentlyViewed(products);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Fetch recommended products
  useEffect(() => {
    const loadRecommended = async () => {
      setLoadingRecommended(true);
      try {
        // Always fetch all products for recommendations (don't depend on Redux state)
        const allProductsResponse = await productsAPI.getProducts({ limit: 100 });
        const allProducts = allProductsResponse.data?.products || [];
        
        if (allProducts.length === 0) {
          setRecommendedProducts([]);
          return;
        }
        
        const recentIds = getRecentlyViewed();
        
        if (recentIds.length > 0) {
          // Get preferred categories from recently viewed products
          const preferredCategories = getPreferredCategories(
            recentIds.map(r => r.productId),
            allProducts
          );
          
          if (preferredCategories.length > 0) {
            // Fetch products from the top preferred category
            const categoryResponse = await productsAPI.getProducts({
              category: preferredCategories[0],
              limit: 20
            });
            const recommended = categoryResponse.data?.products || [];
            
            // Filter out recently viewed products
            const recentProductIds = recentIds.map(r => r.productId);
            const filtered = recommended.filter(
              (p: Product) => !recentProductIds.includes(p.id)
            );
            
            // If we have enough filtered products, use them
            if (filtered.length >= 4) {
              setRecommendedProducts(filtered.slice(0, 8));
            } else {
              // Fallback: use all products excluding recently viewed
              const fallback = allProducts
                .filter((p: Product) => !recentProductIds.includes(p.id))
                .slice(0, 8);
              setRecommendedProducts(fallback);
            }
          } else {
            // No categories found, show all products excluding recently viewed
            const recentProductIds = recentIds.map(r => r.productId);
            const fallback = allProducts
              .filter((p: Product) => !recentProductIds.includes(p.id))
              .slice(0, 8);
            setRecommendedProducts(fallback);
          }
        } else {
          // No viewing history, show general products (shuffle for variety)
          const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
          setRecommendedProducts(shuffled.slice(0, 8));
        }
      } catch (error) {
        console.error('Error loading recommended products:', error);
        // Fallback to featured products if available
        if (products.length > 0) {
          setRecommendedProducts(products.slice(0, 8));
        } else {
          setRecommendedProducts([]);
        }
      } finally {
        setLoadingRecommended(false);
      }
    };

    // Load recommendations after a short delay to ensure products are available
    const timer = setTimeout(() => {
      loadRecommended();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const handleQuickAdd = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    await dispatch(addToCart({ productId, quantity: 1 }));
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-r from-amazon-orange via-orange-600 to-amazon-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Shop Smart.
              <span className="block text-orange-100">Shop Fast.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Discover millions of products with lightning-fast delivery and unbeatable prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-amazon-orange px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Start Shopping
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Easy Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Shopping Section */}
      {isAuthenticated && cart && cart.items && cart.items.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100 py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue Your Shopping</h2>
                  <p className="text-gray-600">
                    You have <span className="font-semibold text-amazon-orange">{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span> item(s) waiting in your cart
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center bg-amazon-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  View Cart
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Section - Compact Design */}
      {recentlyViewed.length > 0 && (
        <section className="py-6 bg-gray-50/50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-700">Recently Viewed</h3>
                <span className="text-xs text-gray-500">• Based on your activity</span>
              </div>
              {recentlyViewed.length > 5 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel(recentScrollRef, 'left')}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    aria-label="Scroll left"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel(recentScrollRef, 'right')}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    aria-label="Scroll right"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {loadingRecent ? (
              <div className="flex gap-3 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <CompactProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Fade gradient at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none"></div>
                
                <div
                  ref={recentScrollRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {recentlyViewed.map((product) => (
                    <CompactProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recommended for You Section - Compact Horizontal */}
      {recommendedProducts.length > 0 && (
        <section className="py-6 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-700">Recommended for You</h3>
                <span className="text-xs text-gray-500">• Based on your browsing</span>
              </div>
              {recommendedProducts.length > 5 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel(recommendedScrollRef, 'left')}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    aria-label="Scroll left"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel(recommendedScrollRef, 'right')}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    aria-label="Scroll right"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {loadingRecommended ? (
              <div className="flex gap-3 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <CompactProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Fade gradient at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                
                <div
                  ref={recommendedScrollRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {recommendedProducts.map((product) => (
                    <CompactRecommendedCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Products</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amazon-orange to-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">Handpicked selections just for you</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-600 text-lg mb-2">No products available yet.</p>
              <p className="text-gray-500">Check back soon for amazing products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isHovered={hoveredProduct === product.id}
                  onHover={() => setHoveredProduct(product.id)}
                  onLeave={() => setHoveredProduct(null)}
                  onQuickAdd={handleQuickAdd}
                  isFeatured={index < 2}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Compact Product Card for Recently Viewed
interface CompactProductCardProps {
  product: Product;
  onQuickAdd: (e: React.MouseEvent, productId: string) => void;
}

// Compact Product Card for Recommended Section
interface CompactRecommendedCardProps {
  product: Product;
  onQuickAdd: (e: React.MouseEvent, productId: string) => void;
}

const CompactRecommendedCard = ({ product, onQuickAdd }: CompactRecommendedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group flex-shrink-0 w-36 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-amazon-orange/30 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Compact Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {getProductImage(product) ? (
            <img
              src={getProductImage(product) || ''}
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-2xl">📦</span>
            </div>
          )}
        </div>
        
        {/* Compact Product Info */}
        <div className="p-2.5">
          <h4 className="text-xs font-medium text-gray-900 line-clamp-1 mb-1.5 group-hover:text-amazon-orange transition-colors">
            {product.name}
          </h4>
          
          {/* Compact Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            {product.averageRating && product.averageRating > 0 ? (
              <span className="text-amazon-orange text-xs leading-none">
                {renderFilledStars(product.averageRating)}
              </span>
            ) : (
              <span className="text-gray-300 text-xs">☆☆☆☆☆</span>
            )}
          </div>
          
          {/* Compact Price */}
          <div className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</div>
        </div>
      </Link>
      
      {/* Quick Add Button on Hover */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickAdd(e, product.id);
          }}
          className="absolute bottom-2 right-2 p-2 bg-amazon-orange text-white rounded-full shadow-lg hover:bg-orange-600 transition-all transform hover:scale-110 z-20"
          aria-label="Add to cart"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};

const CompactProductCard = ({ product, onQuickAdd }: CompactProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-amazon-orange/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {getProductImage(product) ? (
          <img
            src={getProductImage(product) || ''}
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-3xl">📦</span>
          </div>
        )}
      </div>
      
      {/* Compact Product Info */}
      <div className="p-2.5">
        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1.5 min-h-[2rem] group-hover:text-amazon-orange transition-colors">
          {product.name}
        </h4>
        
        {/* Compact Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          {product.averageRating && product.averageRating > 0 ? (
            <span className="text-amazon-orange text-xs leading-none">
              {renderFilledStars(product.averageRating)}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">☆☆☆☆☆</span>
          )}
        </div>
        
        {/* Compact Price */}
        <div className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</div>
      </div>
    </Link>
  );
};

// Premium Product Card Component
interface ProductCardProps {
  product: Product;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onQuickAdd: (e: React.MouseEvent, productId: string) => void;
  isFeatured?: boolean;
}

const ProductCard = ({ product, isHovered, onHover, onLeave, onQuickAdd, isFeatured = false }: ProductCardProps) => {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-amazon-orange/20"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Best Seller
        </div>
      )}
      
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {getProductImage(product) ? (
          <img
            src={getProductImage(product) || ''}
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-6xl">📦</span>
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 ${isHovered ? 'bg-black/5' : ''}`}></div>
        
        {/* Quick Actions on Hover */}
        <div className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={(e) => onQuickAdd(e, product.id)}
            className="flex-1 bg-amazon-orange hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Add to Cart
          </button>
          <Link
            to={`/products/${product.id}`}
            className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            Quick View
          </Link>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-amazon-orange transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {product.averageRating && product.averageRating > 0 ? (
              <span className="text-amazon-orange text-sm font-medium">
                {renderFilledStars(product.averageRating)}
              </span>
            ) : (
              <span className="text-gray-300 text-sm">☆☆☆☆☆</span>
            )}
          </div>
          <span className="text-xs text-blue-600 hover:underline">
            ({product.totalReviews || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
        </div>
        
        {/* Stock Status */}
        <div className="flex items-center justify-between">
          {product.stock > 0 ? (
            <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Home;
