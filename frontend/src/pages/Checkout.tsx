import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCart, clearCart } from '../store/slices/cartSlice';
import { ordersAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatPrice } from '../utils/currency';
import { validateUPI, getUPIExamples } from '../utils/upiValidation';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type PaymentMethod = 'card' | 'cod' | 'upi';

interface CheckoutFormProps {
  onSuccess: () => void;
  paymentMethod: PaymentMethod;
}

const CardPaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Create payment intent
      const { data } = await ordersAPI.createPaymentIntent(total);
      const { clientSecret, paymentIntentId } = data;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: formData.country,
            },
          },
        },
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create order
        await ordersAPI.createOrder({
          ...formData,
          paymentIntentId,
          paymentMethod: 'card',
        });

        dispatch(clearCart());
        onSuccess();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 font-semibold">Address *</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">State *</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">Zip Code *</label>
          <input
            type="text"
            required
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Country *</label>
          <input
            type="text"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>

      <div className="border border-gray-300 rounded-md p-4">
        <label className="block mb-2 font-semibold">Card Details *</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-amazon-orange text-white py-3 rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
      >
        {loading ? 'Processing Payment...' : `Pay ${formatPrice(total)}`}
      </button>
    </form>
  );
};

const CODPaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ordersAPI.createOrder({
        ...formData,
        paymentMethod: 'cod',
      });
      dispatch(clearCart());
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <p className="text-blue-800 font-semibold">💵 Cash on Delivery</p>
        <p className="text-blue-600 text-sm mt-1">Pay cash when your order is delivered</p>
      </div>

      <div>
        <label className="block mb-2 font-semibold">Address *</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">State *</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">Zip Code *</label>
          <input
            type="text"
            required
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Country *</label>
          <input
            type="text"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-lg"
      >
        {loading ? 'Placing Order...' : `Place Order (Pay ${formatPrice(total)} on Delivery)`}
      </button>
    </form>
  );
};

const UPIPaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [upiError, setUpiError] = useState<string>('');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    upiId: '',
  });

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  const handleUPIChange = (value: string) => {
    setFormData({ ...formData, upiId: value });
    setUpiError('');
    
    // Validate on change (but don't show error until user tries to submit or leaves field)
    if (value && value.includes('@')) {
      const validation = validateUPI(value);
      if (!validation.isValid) {
        setUpiError(validation.error || 'Invalid UPI ID');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate UPI ID
    const validation = validateUPI(formData.upiId);
    if (!validation.isValid) {
      setUpiError(validation.error || 'Invalid UPI ID');
      return;
    }
    
    setLoading(true);
    try {
      await ordersAPI.createOrder({
        ...formData,
        paymentMethod: 'upi',
        upiId: formData.upiId,
      });
      dispatch(clearCart());
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const upiExamples = getUPIExamples();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
        <p className="text-purple-800 font-semibold">📱 UPI Payment</p>
        <p className="text-purple-600 text-sm mt-1">Pay using UPI (Google Pay, PhonePe, Paytm, etc.)</p>
      </div>

      <div>
        <label className="block mb-2 font-semibold">UPI ID *</label>
        <input
          type="text"
          required
          value={formData.upiId}
          onChange={(e) => handleUPIChange(e.target.value)}
          onBlur={() => {
            if (formData.upiId) {
              const validation = validateUPI(formData.upiId);
              if (!validation.isValid) {
                setUpiError(validation.error || 'Invalid UPI ID');
              }
            }
          }}
          placeholder="username@paytm"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amazon-orange ${
            upiError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-amazon-orange'
          }`}
        />
        {upiError && (
          <p className="text-sm text-red-600 mt-1">{upiError}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold">Examples:</span> {upiExamples.slice(0, 4).join(', ')}
        </p>
        <div className="text-xs text-gray-400 mt-1">
          Valid handles: paytm, ybl, oksbi, okaxis, okhdfcbank, icici, hdfcbank, sbi, axisbank, etc.
        </div>
      </div>

      <div>
        <label className="block mb-2 font-semibold">Address *</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">State *</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">Zip Code *</label>
          <input
            type="text"
            required
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Country *</label>
          <input
            type="text"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-amazon-orange focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !!upiError}
        className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-lg"
      >
        {loading ? 'Processing...' : `Pay ${formatPrice(total)} via UPI`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-lg shadow-sm p-12 max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
          <button
            onClick={() => navigate('/products')}
            className="bg-amazon-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-lg shadow-sm p-12 max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4 text-green-600">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            {paymentMethod === 'cod' 
              ? 'Your order will be delivered soon. Please keep cash ready for payment.'
              : paymentMethod === 'upi'
              ? 'Your UPI payment will be processed. Order will be confirmed upon payment.'
              : 'Your payment was successful. Order will be delivered soon.'}
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-amazon-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition font-semibold"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div       className="min-h-screen bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'card'
                      ? 'border-amazon-orange bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-semibold">Card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'cod'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-semibold">COD</div>
                  <div className="text-xs text-gray-500 mt-1">Cash on Delivery</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'upi'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-semibold">UPI</div>
                  <div className="text-xs text-gray-500 mt-1">Google Pay, PhonePe</div>
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                {paymentMethod === 'card' ? (
                  <Elements stripe={stripePromise}>
                    <CardPaymentForm onSuccess={() => setSuccess(true)} />
                  </Elements>
                ) : paymentMethod === 'cod' ? (
                  <CODPaymentForm onSuccess={() => setSuccess(true)} />
                ) : (
                  <UPIPaymentForm onSuccess={() => setSuccess(true)} />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-2xl pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-amazon-orange">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
