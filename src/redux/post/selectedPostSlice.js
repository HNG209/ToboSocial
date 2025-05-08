import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createCommentAPI, fetchPostAuthorAPI, fetchLikersAPIv2, fetchPostCommentsAPIv2, fetchPostDetailAPI, likeStatusAPIv2, likeAPIv2, unlikeAPIv2 } from "../../services/api.service";

const getLocalStorageId = () => {
    //get user from localStorage
    const userFromStorage = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user'))
        : null;

    //get user by id in localStorage
    return userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage
}

export const fetchPostDetail = createAsyncThunk('posts/fetchPostDetail', async (postId, { rejectWithValue }) => {
    try {
        // fetch author
        const authorResponse = await fetchPostAuthorAPI(postId)
        // fetch comments
        const commentsResponse = await fetchPostCommentsAPIv2(postId, getLocalStorageId())
        // fetch post likers
        const likersResponse = await fetchLikersAPIv2(postId, 'post')
        // like status
        const likeStatus = await likeStatusAPIv2(postId, getLocalStorageId(), 'post')

        return { authorResponse, commentsResponse, likersResponse, likeStatus };
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});


export const fetchPost = createAsyncThunk('posts/fetchPost', async (postId, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const postInProfile = state.profile.posts.find(post => post._id === postId);
        // fetch post, don't need to call API if not neccessary
        const postResponse = postInProfile || await fetchPostDetailAPI(postId)

        return postResponse;
    } catch (error) {
        console.error('Error in fetching post:', error.message);
        return rejectWithValue(error.message);
    }
});

export const createComment = createAsyncThunk('posts/createComment', async ({ postId, text }, { rejectWithValue }) => {
    try {

        const response = await createCommentAPI(postId, getLocalStorageId(), text);

        return response;
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const likePost = createAsyncThunk('posts/likePost', async (postId, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const likeCount = state.profile.posts.find(post => post._id === postId).likeCount;
        const response = await likePostAPIv2(postId, getLocalStorageId());

        return response;
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleLike = createAsyncThunk('posts/toggleLike', async (postId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(postId, getLocalStorageId(), 'post');
        if (!rs.isLiked) {
            return { postId, result: await likeAPIv2(postId, getLocalStorageId(), 'post') };
        }

        return { postId, result: await unlikeAPIv2(postId, getLocalStorageId(), 'post') };

    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleCommentLike = createAsyncThunk('posts/toggleCommentLike', async (commentId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(commentId, getLocalStorageId(), 'comment');

        if (!rs.isLiked) {
            return await likeAPIv2(commentId, getLocalStorageId(), 'comment');
        }

        return await unlikeAPIv2(commentId, getLocalStorageId(), 'comment');

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
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.post = action.payload;
            })
            // ===== Fetch Posts by User =====
            .addCase(fetchPostDetail.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(fetchPostDetail.fulfilled, (state, action) => {
                const { authorResponse, commentsResponse, likersResponse, likeStatus } = action.payload;
                state.status = 'succeeded';
                state.author = authorResponse;
                state.comments = commentsResponse; // đã có trạng thái like của người dùng
                state.likers = likersResponse.users;
                state.isLiked = likeStatus.isLiked;
            })
            .addCase(fetchPostDetail.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })

            //Create comment
            .addCase(createComment.fulfilled, (state, action) => {
                state.comments = [...state.comments, action.payload];
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload;
            })

            //toggle like
            .addCase(toggleLike.fulfilled, (state, action) => {
                state.isLiked = action.payload.result.isLiked;
                if (state.post) {
                    state.post.likeCount = action.payload.result.isLiked ? state.post.likeCount + 1 : state.post.likeCount - 1;
                }
            })

            //toggle comment like
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                const { targetId, isLiked } = action.payload;

                const commentIndex = state.comments.findIndex(c => c._id === targetId);
                if (commentIndex !== -1) {
                    state.comments[commentIndex].isLiked = isLiked;
                }
            })
    }
})

export default selectedPostSlice.reducer;