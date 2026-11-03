import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import { Cart } from '../../types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await cartAPI.getCart();
  return response.data;
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity?: number }) => {
    await cartAPI.addToCart(productId, quantity);
    const response = await cartAPI.getCart();
    return response.data;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    await cartAPI.updateCartItem(itemId, quantity);
    const response = await cartAPI.getCart();
    return response.data;
  }
);

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId: string) => {
  await cartAPI.removeFromCart(itemId);
  const response = await cartAPI.getCart();
  return response.data;
});

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  await cartAPI.clearCart();
  const response = await cartAPI.getCart();
  return response.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
