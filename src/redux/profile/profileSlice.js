import { fetchPostByUserAPI, followUserAPI, getUserAPI, getUserAPIv2, unfollowUserAPI, updateUserAPI } from "../../services/api.service";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleLike } from "../post/selectedPostSlice";

const getLocalStorageId = () => {
    //get user from localStorage
    const userFromStorage = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user'))
        : null;

    //get user by id in localStorage
    return userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage
}

export const fetchPostByUser = createAsyncThunk(
    'posts/fetchPostByUser',
    async ({ id, page, limit }, { rejectWithValue }) => {
        const resolvedId = id ?? getLocalStorageId(); // Nếu id != null/undefined thì dùng id, ngược lại dùng userId từ storage
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
        const resolvedId = id ?? getLocalStorageId();
        try {
            const response = await getUserAPIv2(resolvedId, getLocalStorageId());
            return response;
        } catch (error) {
            console.error('Error in getUserById:', error.message);
            return rejectWithValue(error.message);
        }
    }
);


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

export const followUser = createAsyncThunk('user/followUser', async (id, { rejectWithValue }) => {
    try {
        const response = await followUserAPI(getLocalStorageId(), id);
        return response;
    } catch (error) {
        console.error('Error in followUser:', error.message);
        return rejectWithValue(error.message);
    }
});

export const unfollowUser = createAsyncThunk('user/unfollowUser', async (id, { rejectWithValue }) => {
    try {
        const response = await unfollowUserAPI(getLocalStorageId(), id);
        return response;
    } catch (error) {
        console.error('Error in unfollowUser:', error.message);
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
            .addCase(toggleLike.fulfilled, (state, action) => {                
                const post = state.posts.find(p => p._id === action.payload.postId);
                if (post) {
                    post.likeCount = action.payload.result.isLiked ? post.likeCount + 1 : post.likeCount - 1;
                }
            })
            // ===== Fetch Posts by User =====
            .addCase(fetchPostByUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(fetchPostByUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                state.posts = action.payload; // Gán danh sách bài viết từ API
                console.log(action.payload)
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
            })

            // follow user
            .addCase(followUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                state.user.isFollowedByCurrentUser = action.payload?.isFollowing;
                // state.user = action.payload; // Cập nhật thông tin người dùng từ API
            })
            .addCase(followUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })

            // unfollow user
            .addCase(unfollowUser.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
                state.user.isFollowedByCurrentUser = action.payload?.isFollowing;
                // state.user = action.payload; // Cập nhật thông tin người dùng từ API
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            });
    }
});

export const { setStatus } = profileSlice.actions;
export default profileSlice.reducer;