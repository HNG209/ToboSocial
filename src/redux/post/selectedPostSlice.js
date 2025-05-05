import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createCommentAPI, fetchPostAuthorAPI, fetchLikersAPIv2, fetchPostCommentsAPIv2, fetchPostDetailAPI, likeStatusAPIv2, likeAPIv2, unlikeAPIv2 } from "../../services/api.service";

//get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

//get user by id in localStorage
const userId = userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage

export const fetchPostDetailById = createAsyncThunk('posts/fetchPostById', async (postId, { rejectWithValue }) => {
    try {
        // fetch post
        const postResponse = await fetchPostDetailAPI(postId)
        // fetch author
        const authorResponse = await fetchPostAuthorAPI(postId)
        // fetch comments
        const commentsResponse = await fetchPostCommentsAPIv2(postId, userId)
        // fetch post likers
        const likersResponse = await fetchLikersAPIv2(postId, 'post')
        // like status
        const likeStatus = await likeStatusAPIv2(postId, userId, 'post')

        return { postResponse, authorResponse, commentsResponse, likersResponse, likeStatus };
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const createComment = createAsyncThunk('posts/createComment', async ({ postId, text }, { rejectWithValue }) => {
    try {

        const response = await createCommentAPI(postId, userId, text);

        return response;
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const likePost = createAsyncThunk('posts/likePost', async (postId, { rejectWithValue }) => {
    try {
        const response = await likePostAPIv2(postId, userId);

        return response;
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleLike = createAsyncThunk('posts/toggleLike', async (postId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(postId, userId, 'post');
        if (!rs.isLiked) {
            return await likeAPIv2(postId, userId, 'post');
        }

        return await unlikeAPIv2(postId, userId, 'post');

    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleCommentLike = createAsyncThunk('posts/toggleCommentLike', async (commentId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(commentId, userId, 'comment');

        if (!rs.isLiked) {
            return await likeAPIv2(commentId, userId, 'comment');
        }

        return await unlikeAPIv2(commentId, userId, 'comment');

    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

const selectedPostSlice = createSlice({
    name: 'selectedPost',
    initialState: {
        author: null, // thông tin tác giả của bài viết
        post: {}, // chi tiết bài viết
        isLiked: false, // đã thích bài viết hay chưa, tương đối với người dùng hiện tại đang đăng nhập
        comments: [], // danh sách bình luận của bài viết, đánh dấu đã like đối với người dùng hiện tại
        likers: [], // danh sách những người like bài viết
        status: 'idle', // Trạng thái tải dữ liệu
        error: null, // Lỗi nếu có
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ===== Fetch Posts by User =====
            .addCase(fetchPostDetailById.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(fetchPostDetailById.fulfilled, (state, action) => {
                const { postResponse, authorResponse, commentsResponse, likersResponse, likeStatus } = action.payload;
                state.status = 'succeeded';
                state.post = postResponse;
                state.author = authorResponse;
                state.comments = commentsResponse; // đã có trạng thái like của người dùng
                state.likers = likersResponse.users;
                state.isLiked = likeStatus.isLiked;
            })
            .addCase(fetchPostDetailById.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })

            //Create comment
            .addCase(createComment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.comments = [...state.comments, action.payload];
            })
            .addCase(createComment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            //toggle like
            .addCase(toggleLike.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(toggleLike.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isLiked = action.payload.isLiked;
                if (state.post) {
                    state.post.likeCount = action.payload.isLiked ? state.post.likeCount + 1 : state.post.likeCount - 1;
                }
            })
            .addCase(toggleLike.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            //toggle comment like
            .addCase(toggleCommentLike.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                state.status = 'succeeded';

                const { targetId, isLiked } = action.payload;

                const commentIndex = state.comments.findIndex(c => c._id === targetId);
                if (commentIndex !== -1) {
                    state.comments[commentIndex].isLiked = isLiked;
                }
            })
            .addCase(toggleCommentLike.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
})

export default selectedPostSlice.reducer;