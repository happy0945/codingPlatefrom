import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

// =========================
// REGISTER USER
// =========================
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        "/user/register",
        userData
      );

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Registration failed"
        }
      );
    }
  }
);


// =========================
// LOGIN USER
// =========================
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        "/user/login",
        credentials
      );

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Login failed"
        }
      );
    }
  }
);


// =========================
// CHECK AUTH
// =========================
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/user/check");

      return data.user;
    } catch (error) {

      // User is simply not logged in
      // This is not really an application error
      if (error.response?.status === 401) {
        return rejectWithValue({
          unauthenticated: true
        });
      }

      return rejectWithValue(
        error.response?.data || {
          message: "Authentication check failed"
        }
      );
    }
  }
);


// =========================
// LOGOUT USER
// =========================
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");

      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Logout failed"
        }
      );
    }
  }
);


// =========================
// INITIAL STATE
// =========================
const initialState = {
  user: null,
  isAuthenticated: false,

  // Initial authentication check
  checkingAuth: true,

  // Separate loading states
  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,

  error: null
};


// =========================
// AUTH SLICE
// =========================
const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // =====================================
      // REGISTER
      // =====================================

      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;

        state.user = action.payload;
        state.isAuthenticated = !!action.payload;

        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;

        state.user = null;
        state.isAuthenticated = false;

        state.error =
          action.payload?.message ||
          "Registration failed";
      })


      // =====================================
      // LOGIN
      // =====================================

      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;

        state.user = action.payload;
        state.isAuthenticated = !!action.payload;

        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;

        state.user = null;
        state.isAuthenticated = false;

        state.error =
          action.payload?.message ||
          "Login failed";
      })


      // =====================================
      // CHECK AUTH
      // =====================================

      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
        state.error = null;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;

        state.user = action.payload;
        state.isAuthenticated = !!action.payload;

        state.error = null;
      })

      .addCase(checkAuth.rejected, (state, action) => {
        state.checkingAuth = false;

        state.user = null;
        state.isAuthenticated = false;

        // 401 means user is simply not logged in.
        // Don't show this as an actual error.
        if (!action.payload?.unauthenticated) {
          state.error =
            action.payload?.message ||
            "Authentication check failed";
        }
      })


      // =====================================
      // LOGOUT
      // =====================================

      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;

        state.user = null;
        state.isAuthenticated = false;

        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;

        state.error =
          action.payload?.message ||
          "Logout failed";
      });
  }
});

export default authSlice.reducer;