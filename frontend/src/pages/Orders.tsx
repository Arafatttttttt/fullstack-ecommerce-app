import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { ordersAPI } from '../services/api';
import { addToCart } from '../store/slices/cartSlice';
import { Order, OrderItem } from '../types';
import { formatPrice } from '../utils/currency';
import { getProductImage } from '../utils/productImages';
import OrderCardSkeleton from '../components/skeletons/OrderCardSkeleton';

const CANCELLATION_REASONS = [
  'Found cheaper somewhere else',
  'Reviews were bad',
  'Changed my mind',
  'Duplicate order',
  'Ordered by mistake',
  'Delivery time too long',
  'Product not needed anymore',
  'Other reason',
];

type FilterStatus = 'all' | 'delivered' | 'cancelled';

const Orders = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [cancelModalOpen, setCancelModalOpen] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSearchOrders();
  }, [orders, filter, searchQuery]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchOrders = () => {
    let filtered = [...orders];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((order) => order.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleReorder = async (order: Order) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      // Add all items from the order to cart
      for (const item of order.items) {
        await dispatch(addToCart({ productId: item.productId, quantity: item.quantity })).unwrap();
      }
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  const handleCancelClick = (orderId: string) => {
    setCancelModalOpen(orderId);
    setSelectedReason('');
    setCustomReason('');
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOpen) return;
    if (!selectedReason) {
      alert('Please select a cancellation reason');
      return;
    }

    const reason = selectedReason === 'Other reason' ? customReason : selectedReason;
    if (!reason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(cancelModalOpen, reason);
      alert('Order cancelled successfully');
      setCancelModalOpen(null);
      setSelectedReason('');
      setCustomReason('');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = (order: Order) => {
    return order.status !== 'cancelled' && order.status !== 'delivered';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleReview = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state is handled inline with skeletons

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-amazon-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setFilter('delivered')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === 'delivered'
                    ? 'bg-amazon-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-amazon-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-700 text-lg font-medium mb-2">
              {searchQuery || filter !== 'all'
                ? 'No orders found'
                : "You haven't placed any orders yet"}
            </p>
            <p className="text-gray-500">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start shopping to see your orders here!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusBadgeColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-gray-900 font-bold text-lg">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <Link
                        key={item.id}
                        to={`/products/${item.product.id}`}
                        className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {getProductImage(item.product) ? (
                            <img
                              src={getProductImage(item.product) || ''}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-amazon-orange transition-colors line-clamp-2">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {order.status === 'delivered' && (
                      <>
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={() => handleReview(order.items[0]?.productId)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          Write Review
                        </button>
                      </>
                    )}
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelClick(order.id)}
                        className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors ml-auto"
                    >
                      {expandedOrders.has(order.id) ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrders.has(order.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {/* Shipping Address */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Shipping Address</h5>
                        <p className="text-sm text-gray-600">
                          {order.address}, {order.city}, {order.state} {order.zipCode}, {order.country}
                        </p>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Payment Method</h5>
                        <p className="text-sm text-gray-600 capitalize">
                          {order.paymentId === 'cod' ? 'Cash on Delivery' : order.paymentId?.startsWith('pi_') ? 'Card Payment' : 'UPI Payment'}
                        </p>
                      </div>

                      {/* Cancellation Reason */}
                      {order.cancellationReason && (
                        <div>
                          <h5 className="text-sm font-semibold text-red-900 mb-1">Cancellation Reason</h5>
                          <p className="text-sm text-red-700">{order.cancellationReason}</p>
                        </div>
                      )}

                      {/* Full Order ID */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Order ID</h5>
                        <p className="text-sm text-gray-600 font-mono">{order.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Order Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Cancel Order</h2>
              <p className="text-gray-600 mb-4">Please select a reason for cancelling this order:</p>
              
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {CANCELLATION_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other reason' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Please specify:
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter your reason..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !selectedReason || (selectedReason === 'Other reason' && !customReason.trim())}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  onClick={() => {
                    setCancelModalOpen(null);
                    setSelectedReason('');
                    setCustomReason('');
                  }}
                  disabled={cancelling}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;