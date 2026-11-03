import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/currency';
import { getProductImage } from '../utils/productImages';

const Cart = () => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ itemId, quantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Amazon Cart is empty</h1>
            <p className="text-gray-600 mb-6">Shop today's deals</p>
            <Link 
              to="/products" 
              className="inline-block bg-amazon-orange hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link to="/products" className="text-blue-600 hover:text-amazon-orange hover:underline text-sm">
            Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="mb-4 pb-4 border-b">
                <span className="text-lg font-semibold text-gray-900">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                      {getProductImage(item.product) ? (
                        <img
                          src={getProductImage(item.product) || ''}
                          alt={item.product.name}
                          className="w-24 h-24 object-contain bg-white border border-gray-200 rounded p-2"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/products/${item.product.id}`} className="text-lg text-blue-600 hover:text-amazon-orange hover:underline mb-2 block">
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition font-semibold"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 font-semibold min-w-[3rem] text-center border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-3 py-1 hover:bg-gray-100 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-blue-600 hover:text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t text-right text-lg font-semibold text-gray-900">
                Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}): 
                <span className="ml-2">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}): 
                  <span className="ml-2">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-amazon-orange hover:bg-orange-600 text-white text-center py-3 rounded-md font-semibold transition mb-3"
                >
                  Proceed to Checkout
                </Link>
                <div className="text-xs text-gray-600">
                  <p className="mb-1">✔️ FREE delivery on orders over $25</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
