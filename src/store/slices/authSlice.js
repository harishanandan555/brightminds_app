import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { login as loginApi } from '../../api/authApi';
import { getProfile } from '../../api/userApi';
const initialState = {
    role: null, // 'teacher' or 'parent'
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            // 1. Login to get token
            const loginResponse = await loginApi(credentials);
            const { token } = loginResponse;

            if (token) {
                // Set the token in the axios instance defaults for subsequent requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            // 2. Fetch profile using the token
            const userProfile = await getProfile();

            return {
                ...loginResponse,
                user: userProfile,
                role: userProfile.role || 'teacher'
            };
        } catch (error) {
            // Return a serializable error message, not the full object
            const message = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                'Login failed';
            return rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.role = null;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.role = action.payload.role;
                state.token = action.payload.token; // If exists
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
                state.isAuthenticated = false;
            });
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
