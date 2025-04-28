import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
    fetchCommentsByPostAPI,
    createCommentAPI,
    deleteCommentAPI,
    updateCommentAPI
} from '../../services/api.service';

// Like comment
export const likeComment = createAsyncThunk('posts/likeComment', async ({ postId, commentId, userId }) => {
    const response = await likeCommentAPI(commentId, userId);
    return { postId, commentId, userId };
});

// Unlike comment
export const unlikeComment = createAsyncThunk('posts/unlikeComment', async ({ postId, commentId, userId }) => {
    const response = await unlikeCommentAPI(commentId, userId);
    return { postId, commentId, userId };
});

// Fetch posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await fetchPostsAPI();
    return response; // response là mảng bài viết
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

// Fetch comments for a post
export const fetchComments = createAsyncThunk('posts/fetchComments', async (postId) => {
    const response = await fetchCommentsByPostAPI(postId);
    return { postId, comments: response };
});

// Create a new comment
export const createComment = createAsyncThunk('posts/createComment', async ({ postId, userId, text }) => {
    const response = await createCommentAPI(postId, userId, text);
    return { postId, comment: response };
});

// Delete a comment
export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }) => {
    const response = await deleteCommentAPI(commentId);
    return { postId, commentId };
});

// Update a comment
export const updateComment = createAsyncThunk('posts/updateComment', async ({ postId, commentId, text }) => {
    const response = await updateCommentAPI(commentId, text);
    return { postId, commentId, text };
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
            // ===== Posts =====
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

            // ===== Likes =====
            .addCase(likePost.pending, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const alreadyLiked = post.likes.some(like => like._id === userId);
                    if (!alreadyLiked) {
                        post.likes.push({ _id: userId });
                    }
                }
            })
            .addCase(likePost.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.likes = post.likes.filter(like => like._id !== userId);
                }
            })
            .addCase(unlikePost.pending, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.likes = post.likes.filter(like => like._id !== userId);
                }
            })
            .addCase(unlikePost.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const alreadyLiked = post.likes.some(like => like._id === userId);
                    if (!alreadyLiked) {
                        post.likes.push({ _id: userId });
                    }
                }
            })

            // ===== Comments =====
            .addCase(fetchComments.fulfilled, (state, action) => {
                const { postId, comments } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments = comments;
                }
            })
            .addCase(createComment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments.push(comment);
                }
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                const { postId, commentId } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments = post.comments.filter(comment => comment._id !== commentId);
                }
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                const { postId, commentId, text } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments.find(c => c._id === commentId);
                    if (comment) {
                        comment.text = text;
                    }
                }
            })

            // ===== Likes Comment =====
            .addCase(likeComment.pending, (state, action) => {
                const { postId, commentId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments.find(c => c._id === commentId);
                    if (comment) {
                        const alreadyLiked = comment.likes?.some(like => like._id === userId);
                        if (!alreadyLiked) {
                            if (!comment.likes) comment.likes = [];
                            comment.likes.push({ _id: userId });
                        }
                    }
                }
            })
            .addCase(unlikeComment.pending, (state, action) => {
                const { postId, commentId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments.find(c => c._id === commentId);
                    if (comment) {
                        comment.likes = comment.likes?.filter(like => like._id !== userId) || [];
                    }
                }
            });
    },
});

export default postsSlice.reducer;
