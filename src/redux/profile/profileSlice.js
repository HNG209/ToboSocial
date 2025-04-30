import { fetchPostByUserAPI } from "../../services/api.service";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchPostByUser = createAsyncThunk('posts/fetchPostByUser', async ({ userId, page, limit }, { rejectWithValue }) => {
    try {
        console.log('Fetching posts for user:', userId, 'Page:', page, 'Limit:', limit);
        const response = await fetchPostByUserAPI(userId, page, limit);
        return response;
    } catch (error) {
        console.error('Error in fetchPostByUser:', error.message);
        return rejectWithValue(error.message);
    }
});

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
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
        }
});

export default profileSlice.reducer;