import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import type { AuthState, LoginCredentials, RegisterData } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  '/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const loginResponse = await authAPI.login(credentials);
      localStorage.setItem('token', loginResponse.token);
      const user = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      return { response: loginResponse, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  '/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const registerResponse = await authAPI.register(data);
      localStorage.setItem('token', registerResponse.token);
      const user = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      return { response: registerResponse, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  '/google-login',
  async (googleToken: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.loginWithGoogle(googleToken);
      localStorage.setItem('token', response.token);
      const user = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      return { response, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  '/refresh-token',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      localStorage.setItem('token', response.token);
      const user = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      return { response, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  '/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const user = await authAPI.getProfile();
      return { user, token };
    } catch (_error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw _error;
    }
  }
);

export const logout = createAsyncThunk(
  '/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (_error: any) {
      // Even if the API call fails, we still want to clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.response.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Registration cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.response.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Google login cases
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.response.token;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Token refresh cases
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.response.token;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      });

    // Initialize auth cases
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      });

    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;
