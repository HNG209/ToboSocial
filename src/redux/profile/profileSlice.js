import { fetchPostByUserAPI, getUserAPI, updateUserAPI } from "../../services/api.service";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

//get user by id in localStorage
const userId = userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage

export const fetchPostByUser = createAsyncThunk(
    'posts/fetchPostByUser',
    async ({ id, page, limit }, { rejectWithValue }) => {
        const resolvedId = id ?? userId; // Nếu id != null/undefined thì dùng id, ngược lại dùng userId từ storage
        try {
            const response = await fetchPostByUserAPI(resolvedId, page, limit);
            return response;
        } catch (error) {
            console.error('Error in fetchPostByUser:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'user/getCurrentUser',
    async ({ id }, { rejectWithValue }) => {
        const resolvedId = id ?? userId;
        try {
            const response = await getUserAPI(resolvedId);
            return response;
        } catch (error) {
            console.error('Error in getUserById:', error.message);
            return rejectWithValue(error.message);
        }
    }
);


//get post and current user by id


//update user by id
export const updateUser = createAsyncThunk('user/updateUser', async (data, { rejectWithValue }) => {
    try {
        const response = await updateUserAPI(data);
        return response;
    } catch (error) {
        console.error('Error in updateUserById:', error.message);
        return rejectWithValue(error.message);
    }
});

const initialState = {
    user: null, // Thông tin người dùng hiện tại
    posts: [], // Danh sách bài viết
    postDetail: null, // Chi tiết bài viết
    status: 'idle', // Trạng thái tải dữ liệu
    error: null, // Lỗi nếu có
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setStatus: (state, action) => {
            state.status = action.payload; // payload là giá trị status mới, ví dụ: 'idle', 'loading', v.v.
        }
    },
    extraReducers: (builder) => {
        builder
            // ===== Fetch Posts by User =====
            .addCase(fetchPostByUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(fetchPostByUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                state.posts = action.payload; // Gán danh sách bài viết từ API
            })
            .addCase(fetchPostByUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })
            // ===== Get User by ID =====
            .addCase(getCurrentUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                state.user = action.payload; // Gán thông tin người dùng từ API
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })
            // ===== Update User by ID =====
            .addCase(updateUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                // state.user = action.payload; // Cập nhật thông tin người dùng từ API
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            });
    }
});

export const { setStatus } = profileSlice.actions;
export default profileSlice.reducer;