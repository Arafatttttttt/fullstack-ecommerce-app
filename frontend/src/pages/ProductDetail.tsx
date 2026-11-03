import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { productsAPI, reviewsAPI } from '../services/api';
import { addToCart } from '../store/slices/cartSlice';
import { Product, Review } from '../types';
import { formatPrice } from '../utils/currency';
import { addToRecentlyViewed } from '../utils/personalization';
import { getProductImages } from '../utils/productImages';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await productsAPI.getProductById(id);
        setProduct(response.data);
        const images = getProductImages(response.data);
        if (images.length > 0) {
          setSelectedImage(images[0]);
        }
        // Track recently viewed product
        addToRecentlyViewed(id);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const response = await reviewsAPI.getProductReviews(id);
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        setCanReview(response.data.canReview);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    await dispatch(addToCart({ productId: product.id, quantity }));
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    // Add to cart first, then navigate to checkout
    await dispatch(addToCart({ productId: product.id, quantity }));
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !id || !reviewRating) return;
    
    setSubmittingReview(true);
    try {
      await reviewsAPI.createReview(id, reviewRating, reviewComment);
      // Refresh reviews
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setCanReview(response.data.canReview);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await reviewsAPI.deleteReview(reviewId);
      // Refresh reviews
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setCanReview(response.data.canReview);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const displayRating = interactive ? (hoveredStar || reviewRating) : rating;
          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
              onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
              onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
              className={interactive ? 'cursor-pointer' : ''}
              disabled={!interactive}
            >
              <span className={`text-2xl ${star <= displayRating ? 'text-amazon-orange' : 'text-gray-300'}`}>
                ★
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Product not found</h1>
          <Link to="/products" className="text-amazon-orange hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const userReview = reviews.find((r) => r.userId === user?.id);

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-amazon-orange hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-amazon-orange hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images Gallery */}
            <div>
              {(() => {
                const images = getProductImages(product);
                
                if (images.length === 0) {
                  return (
                    <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
                      <span className="text-gray-400 text-8xl">📦</span>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg p-4 h-96">
                      <img
                        src={selectedImage || images[0]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(img)}
                            className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                              (selectedImage || images[0]) === img ? 'border-amazon-orange' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {!reviewLoading && averageRating > 0 ? (
                  <>
                    {renderStars(averageRating)}
                    <span className="text-sm text-blue-600 hover:text-amazon-orange hover:underline cursor-pointer">
                      ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-amazon-orange font-semibold">★★★★★</span>
                    <span className="text-sm text-gray-500">(No reviews yet)</span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">In Stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Currently unavailable</span>
                )}
              </div>

              {/* Category */}
              <div className="mb-6 text-sm text-gray-600">
                <span>Category: </span>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-blue-600 hover:text-amazon-orange hover:underline">
                  {product.category}
                </Link>
              </div>

              {/* Quantity and Add to Cart */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-amazon-orange hover:bg-orange-600 text-white py-3 rounded-md font-semibold transition mb-4"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 rounded-md font-semibold transition"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {/* Product Description */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About this item</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            {isAuthenticated && !userReview && canReview && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-amazon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md font-semibold transition"
              >
                Write a Review
              </button>
            )}
            {isAuthenticated && !userReview && !canReview && (
              <div className="text-sm text-gray-500 italic">
                You can review this product after receiving your order
              </div>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && isAuthenticated && !userReview && canReview && (
            <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Rating *</label>
                {renderStars(0, true, setReviewRating)}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  placeholder="Share your thoughts about this product..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewRating || submittingReview}
                  className="bg-amazon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewRating(0);
                    setReviewComment('');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing User Review */}
          {userReview && (
            <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{userReview.user.name}</span>
                    <span className="text-sm text-gray-500">({formatDate(userReview.createdAt)})</span>
                  </div>
                  {renderStars(userReview.rating)}
                </div>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
              {userReview.comment && (
                <p className="text-gray-700 mt-2">{userReview.comment}</p>
              )}
            </div>
          )}

          {/* Reviews List */}
          {reviewLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews
                .filter((review) => review.userId !== user?.id) // Don't show user's own review in list
                .map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.user.name}</span>
                      <span className="text-sm text-gray-500">({formatDate(review.createdAt)})</span>
                    </div>
                    {renderStars(review.rating)}
                    {review.comment && (
                      <p className="text-gray-700 mt-3">{review.comment}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
