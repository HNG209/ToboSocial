import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    loginAPI,
    logoutAPI,
    registerAPI,
    forgotPasswordAPI,
    followUserAPI,
    unfollowUserAPI
} from '../../services/user.service';
import { getUserProfile } from '../../services/api.service';


export const getAuthUser = createAsyncThunk(
    'user/getAuthUser',
    async (_, { rejectWithValue }) => {
        try {
            const rs = await getUserProfile();
            return rs;
        } catch (error) {
            console.error('Error in getUserById:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await loginAPI(username, password);
        console.log('Login response:', response);
        const { accessToken, user } = response;

        // Lưu accessToken vào localStorage hoặc Redux state
        localStorage.setItem('accessToken', accessToken);
        // localStorage.setItem('user', JSON.stringify(user));

        return { user, accessToken }; // gán vào state nếu cần

    } catch (error) {
        return rejectWithValue(error.message || 'Login failed');
    }
});


// Follow
export const followUser = createAsyncThunk('auth/followUser', async ({ targetUserId, currentUserId }, { rejectWithValue }) => {
    try {
        const response = await followUserAPI(targetUserId, currentUserId);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user; // Chỉ trả về user object để cập nhật state
    } catch (error) {
        return rejectWithValue(error.error || 'Follow failed');
    }
});

// Unfollow
export const unfollowUser = createAsyncThunk('auth/unfollowUser', async ({ targetUserId, currentUserId }, { rejectWithValue }) => {
    try {
        const response = await unfollowUserAPI(targetUserId, currentUserId);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user; // Chỉ trả về user object để cập nhật state
    } catch (error) {
        return rejectWithValue(error.error || 'Unfollow failed');
    }
});

// Register
export const register = createAsyncThunk('auth/register', async ({ username, email, password, fullName }, { rejectWithValue }) => {
    try {
        const response = await registerAPI(username, email, password, fullName);
        localStorage.setItem('user', JSON.stringify(response));
        return response;
    } catch (error) {
        return rejectWithValue(error.message || 'Register failed');
    }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await logoutAPI();
        localStorage.removeItem('user');
        return true;
    } catch (error) {
        return rejectWithValue(error.message || 'Logout failed');
    }
});

// Forgot Password
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
        user: null,
        accessToken: localStorage.getItem('accessToken') || null,
        status: 'idle',
        error: null,
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
                state.user = action.payload.user; // Cập nhật state.user với user object từ API
                state.accessToken = action.payload.accessToken; // Cập nhật accessToken
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // dùng để refetch user hiện tại khi trang reload
            .addCase(getAuthUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })

            .addCase(followUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload; // Cập nhật state.user với user object từ API
                state.error = null;
            })
            .addCase(followUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(unfollowUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload; // Cập nhật state.user với user object từ API
                state.error = null;
            })
            .addCase(unfollowUser.rejected, (state, action) => {
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


            .addCase(logout.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = 'idle';
                state.user = null;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(forgotPassword.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default authSlice.reducer;