import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { config } from '../../config';

export const fetchTours = createAsyncThunk(
  'tours/fetchTours',
  async (filters) => {
    try {
      console.log('Fetching tours with filters:', filters);
      const response = await api.get(config.endpoints.tours.list, { params: filters });
      console.log('Tours response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }
  }
);

const toursSlice = createSlice({
  name: 'tours',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      difficulty: null,
      minPrice: null,
      maxPrice: null,
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters } = toursSlice.actions;
export default toursSlice.reducer; 