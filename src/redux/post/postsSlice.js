// src/redux/post/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostsAPI, likePostAPI, unlikePostAPI } from '../../services/api.service';

// Fetch posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await fetchPostsAPI();
    return response; // Giả sử response là mảng bài viết
});

// Like post
export const likePost = createAsyncThunk('posts/likePost', async ({ postId, userId }) => {
    const response = await likePostAPI(postId, userId);
    return { postId, userId };
});

// Unlike post
export const unlikePost = createAsyncThunk('posts/unlikePost', async ({ postId, userId }) => {
    const response = await unlikePostAPI(postId, userId);
    return { postId, userId };
});

const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Like post
            .addCase(likePost.pending, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const postIndex = state.posts.findIndex(p => p._id === postId);
                if (postIndex !== -1) {
                    const post = state.posts[postIndex];
                    const alreadyLiked = post.likes.some(like => like._id === userId);
                    if (!alreadyLiked) {
                        post.likes.push({ _id: userId }); // Thêm object với _id
                    }
                }
            })
            .addCase(likePost.fulfilled, (state, action) => {
                console.log('Like fulfilled:', action.payload);
            })
            .addCase(likePost.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const postIndex = state.posts.findIndex(p => p._id === postId);
                if (postIndex !== -1) {
                    const post = state.posts[postIndex];
                    post.likes = post.likes.filter(like => like._id !== userId); // Rollback
                }
            })
            // Unlike post
            .addCase(unlikePost.pending, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const postIndex = state.posts.findIndex(p => p._id === postId);
                if (postIndex !== -1) {
                    const post = state.posts[postIndex];
                    post.likes = post.likes.filter(like => like._id !== userId);
                }
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                console.log('Unlike fulfilled:', action.payload);
            })
            .addCase(unlikePost.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const postIndex = state.posts.findIndex(p => p._id === postId);
                if (postIndex !== -1) {
                    const post = state.posts[postIndex];
                    const alreadyLiked = post.likes.some(like => like._id === userId);
                    if (!alreadyLiked) {
                        post.likes.push({ _id: userId }); // Rollback
                    }
                }
            });
    },
});

export default postsSlice.reducer;
