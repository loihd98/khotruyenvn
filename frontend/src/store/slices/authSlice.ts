import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { AuthState, User, AuthResponse } from "../../types";
import { authAPI } from "../../utils/api";

// Helper function for role-based redirect
export const getRedirectPath = (user: User | null): string => {
  if (!user) return "/";

  switch (user.role) {
    case "ADMIN":
      return "/admin";
    case "USER":
    default:
      return "/";
  }
};

// ─── Async thunks ────────────────────────────────────────────

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login(email, password);
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error.error || error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string; name: string }
>(
  "auth/register",
  async (
    {
      email,
      password,
      name,
    }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.register(email, password, name);
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.error || error.message || "Registration failed"
      );
    }
  }
);

/**
 * Silent refresh — calls POST /auth/refresh.
 * The httpOnly cookie is sent automatically by the browser.
 * No refresh token is read from Redux state.
 */
export const refreshToken = createAsyncThunk<AuthResponse, void>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      if ("data" in response && response.data) {
        return response.data;
      }
      return response as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.error || error.message || "Token refresh failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    try {
      await authAPI.logout(); // server clears the cookie
    } catch (error) {
      // Ignore logout errors — still clear local state
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.error || error.message || "Failed to get profile"
      );
    }
  }
);

// ─── Initial state ───────────────────────────────────────────
// NOTE: refreshToken is NOT stored in state — it lives in an httpOnly cookie
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// ─── Slice ───────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const authResponse = action.payload;
        if (authResponse) {
          state.user = authResponse.user;
          state.accessToken = authResponse.accessToken;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const authResponse = action.payload;
        if (authResponse) {
          state.user = authResponse.user;
          state.accessToken = authResponse.accessToken;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh token
      .addCase(refreshToken.pending, () => {
        // silent refresh — no loading spinner
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const authResponse = action.payload;
        if (authResponse) {
          state.accessToken = authResponse.accessToken;
          if (authResponse.user) {
            state.user = authResponse.user;
          }
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        // Refresh failed — clear everything
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // Handle rehydration from persisted state
      .addMatcher(
        (action) => action.type === REHYDRATE,
        (state, action: any) => {
          let persistedAuth = null;

          if (action.payload?.auth) {
            persistedAuth = action.payload.auth;
          } else if (action.payload && typeof action.payload === "object") {
            if (action.payload.user) {
              persistedAuth = action.payload;
            }
          }

          if (persistedAuth && persistedAuth.user) {
            // Restore user info; accessToken is NOT persisted — the
            // provider will do a silent /auth/refresh to get a new one.
            return {
              ...state,
              user: persistedAuth.user,
              accessToken: null, // will be set after silent refresh
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
          }

          return {
            ...initialState,
            isLoading: false,
          };
        }
      );
  },
});

export const { clearError, updateUser, setAccessToken, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
