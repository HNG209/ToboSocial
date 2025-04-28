import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, logoutAPI, registerAPI, forgotPasswordAPI } from '../../services/user.service';

// Lấy user từ localStorage nếu có
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

// Async thunk login
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await loginAPI(email, password);
        localStorage.setItem('user', JSON.stringify(response)); // Lưu user
        return response;
    } catch (error) {
        return rejectWithValue(error.message || 'Login failed');
    }
});

// Async thunk register
export const register = createAsyncThunk('auth/register', async ({ username, email, password, fullName }, { rejectWithValue }) => {
    try {
        const response = await registerAPI(username, email, password, fullName);
        localStorage.setItem('user', JSON.stringify(response)); // Auto login sau register
        return response;
    } catch (error) {
        return rejectWithValue(error.message || 'Register failed');
    }
});

// Async thunk logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const response = await logoutAPI();
        localStorage.removeItem('user');
        return true;
    } catch (error) {
        return rejectWithValue(error.message || 'Logout failed');
    }
});

// Async thunk forgot password
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const response = await forgotPasswordAPI(email);
        return response;
    } catch (error) {
        return rejectWithValue(error.message || 'Forgot password failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage,
        status: 'idle', // idle | loading | succeeded | failed
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.status = 'idle';
            })
            .addCase(forgotPassword.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default authSlice.reducer;
