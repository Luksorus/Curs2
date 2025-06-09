import { configureStore } from '@reduxjs/toolkit';
import toursReducer from './slices/toursSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    tours: toursReducer,
    cart: cartReducer,
    auth: authReducer,
  },
}); 