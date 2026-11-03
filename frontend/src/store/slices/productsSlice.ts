import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await productsAPI.getProducts(params);
    return response.data;
  }
);

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  const response = await productsAPI.getCategories();
  return response.data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default productsSlice.reducer;
