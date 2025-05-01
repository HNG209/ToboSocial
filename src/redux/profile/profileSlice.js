import { fetchPostByUserAPI, getUserAPI, updateUserAPI } from "../../services/api.service";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

    //get user by id in localStorage
const userId = userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage

export const fetchPostByUser = createAsyncThunk('posts/fetchPostByUser', async ({ page, limit }, { rejectWithValue }) => {
    try {
        console.log('Fetching posts for user:', userId, 'Page:', page, 'Limit:', limit);
        const response = await fetchPostByUserAPI(userId, page, limit);
        return response;
    } catch (error) {
        console.error('Error in fetchPostByUser:', error.message);
        return rejectWithValue(error.message);
    }
});


export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async ({ rejectWithValue }) => {
    try {
        const response = await getUserAPI(userId);
        return response;
    } catch (error) {
        console.error('Error in getUserById:', error.message);
        return rejectWithValue(error.message);
    }
});

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

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        user: null, // Thông tin người dùng hiện tại đã đăng nhập
        posts: [], // Danh sách bài viết
        postDetail: null, // Chi tiết bài viết
        status: 'idle', // Trạng thái tải dữ liệu
        error: null, // Lỗi nếu có
    },
    reducers: {},
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
                console.log('Update user:', action.payload);
                // state.user = action.payload; // Cập nhật thông tin người dùng từ API
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            });            
        }
});

export default profileSlice.reducer;