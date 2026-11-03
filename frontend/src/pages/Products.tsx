import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts, fetchCategories } from '../store/slices/productsSlice';
import { formatPrice } from '../utils/currency';
import { getProductImage } from '../utils/productImages';
import { renderFilledStars } from '../utils/rating';
import ProductCardSkeleton from '../components/skeletons/ProductCardSkeleton';

const Products = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { products, categories, loading, pagination } = useAppSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        category: selectedCategory || undefined,
        search: search || undefined,
        page: currentPage,
        limit: 16,
      })
    );
  }, [dispatch, selectedCategory, search, currentPage]);

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-amazon-orange hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span>Products</span>
          {search && (
            <>
              <span className="mx-2">/</span>
              <span>Search: "{search}"</span>
            </>
          )}
        </div>

        <div className="flex gap-4">
          {/* Sidebar - Categories */}
          <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Shop by Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition ${
                  selectedCategory === '' ? 'bg-amazon-orange bg-opacity-10 text-amazon-orange font-semibold' : 'text-gray-700'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition ${
                    selectedCategory === category ? 'bg-amazon-orange bg-opacity-10 text-amazon-orange font-semibold' : 'text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters and Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {search ? `Search results for "${search}"` : 'All Products'}
                  </h1>
                  {pagination && (
                    <p className="text-sm text-gray-600 mt-1">
                      Showing {products.length} of {pagination.total} results
                    </p>
                  )}
                </div>
                {/* Mobile category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="md:hidden px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <ProductCardSkeleton count={16} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg mb-2">No products found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow p-4 group"
                    >
                      <div className="aspect-square bg-white flex items-center justify-center mb-3">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product) || ''}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-4xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-amazon-orange transition">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amazon-orange font-semibold text-sm">
                            {product.averageRating && product.averageRating > 0
                              ? renderFilledStars(product.averageRating)
                              : '☆☆☆☆☆'}
                          </span>
                          <span className="text-xs text-blue-600 hover:underline">
                            ({product.totalReviews || 0})
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                        {product.stock === 0 && (
                          <div className="mt-2 text-xs text-red-600">Currently unavailable</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="bg-white rounded-lg shadow-sm p-4 mt-4 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
