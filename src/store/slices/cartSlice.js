import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const submitOrder = createAsyncThunk(
  'cart/submitOrder',
  async (_, { getState }) => {
    const { cart } = getState();
    const response = await api.post('/api/orders', {
      items: cart.items
    });
    return response.data;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    orderSuccess: false
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity <= (existingItem.available_slots || 1)) {
          existingItem.quantity = newQuantity;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.orderSuccess = false;
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        const maxQuantity = item.available_slots || 1;
        const newQuantity = Math.min(Math.max(1, quantity), maxQuantity);
        if (newQuantity !== item.quantity) {
          item.quantity = newQuantity;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.orderSuccess = true;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer; 