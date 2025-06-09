import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { config } from '../../config';

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const initialState = {
      user: serializedUser ? JSON.parse(serializedUser) : null,
      token: token || null,
      loading: false,
      error: null
    };
    console.log('Loading initial auth state:', initialState);
    return initialState;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {
      user: null,
      token: null,
      loading: false,
      error: null
    };
  }
};

export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      console.log('Register attempt with:', 
        formData instanceof FormData ? 
        'FormData object' : 
        formData
      );

      const response = await api.post(config.endpoints.auth.register, formData, {
        headers: formData instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        }
      });

      console.log('Register response:', response.data);
      
      if (response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Saved to localStorage after register:', {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('token')
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка регистрации'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login attempt with:', credentials);
      const response = await api.post(config.endpoints.auth.login, credentials);
      console.log('Login response:', response.data);
      
      if (response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Saved to localStorage after login:', {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('token')
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка входа'
      );
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Cleared localStorage:', {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token')
    });
    return null;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Updating profile with:', userData);
      const response = await api.put('/api/users/profile', userData);
      console.log('Profile update response:', response.data);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Updated user in localStorage:', localStorage.getItem('user'));
      }
      
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка обновления профиля'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: loadState(),
  reducers: {
    updateUser: (state, action) => {
      console.log('Updating user in state:', action.payload);
      state.user = action.payload;
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
        console.log('Updated user in localStorage:', localStorage.getItem('user'));
      } catch (err) {
        console.error('Error saving user to localStorage:', err);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        console.log('Register pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('Register fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        console.log('Register rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        console.log('Login pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        console.log('Logout fulfilled');
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        console.log('Update profile pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log('Update profile fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        console.log('Update profile rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateUser } = authSlice.actions;
export default authSlice.reducer; 