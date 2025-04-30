import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
    fetchCommentsByPostAPI,
    createCommentAPI,
    deleteCommentAPI,
    updateCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
    fetchPostDetailAPI,
} from '../../services/api.service';

// Like comment
export const likeComment = createAsyncThunk('posts/likeComment', async ({ postId, commentId, userId }, { rejectWithValue }) => {
    try {
        console.log('likeComment args:', { postId, commentId, userId });
        const response = await likeCommentAPI(commentId, userId);
        return { postId, commentId, updatedComment: response };
    } catch (error) {
        console.error('Error in likeComment:', error.message);
        return rejectWithValue(error.message);
    }
});

// Unlike comment
export const unlikeComment = createAsyncThunk('posts/unlikeComment', async ({ postId, commentId, userId }, { rejectWithValue }) => {
    try {
        console.log('unlikeComment args:', { postId, commentId, userId });
        const response = await unlikeCommentAPI(commentId, userId);
        return { postId, commentId, updatedComment: response };
    } catch (error) {
        console.error('Error in unlikeComment:', error.message);
        return rejectWithValue(error.message);
    }
});

// Fetch comments for a post
export const fetchComments = createAsyncThunk('posts/fetchComments', async (postId, { rejectWithValue }) => {
    try {
        const response = await fetchCommentsByPostAPI(postId);
        return { postId, comments: response };
    } catch (error) {
        console.error('Error in fetchComments:', error.message);
        return rejectWithValue(error.message);
    }
});

// Các async thunk khác (giữ nguyên)
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
    try {
        const response = await fetchPostsAPI();
        return response;
    } catch (error) {
        console.error('Error in fetchPosts:', error.message);
        return rejectWithValue(error.message);
    }
});

export const likePost = createAsyncThunk('posts/likePost', async ({ postId, userId }, { rejectWithValue }) => {
    try {
        const response = await likePostAPI(postId, userId);
        return { postId, userId };
    } catch (error) {
        console.error('Error in likePost:', error.message);
        return rejectWithValue(error.message);
    }
});

export const unlikePost = createAsyncThunk('posts/unlikePost', async ({ postId, userId }, { rejectWithValue }) => {
    try {
        const response = await unlikePostAPI(postId, userId);
        return { postId, userId };
    } catch (error) {
        console.error('Error in unlikePost:', error.message);
        return rejectWithValue(error.message);
    }
});

export const createComment = createAsyncThunk('posts/createComment', async ({ postId, userId, text }, { rejectWithValue }) => {
    try {
        const response = await createCommentAPI(postId, userId, text);
        return { postId, comment: response };
    } catch (error) {
        console.error('Error in createComment:', error.message);
        return rejectWithValue(error.message);
    }
});

export const updateComment = createAsyncThunk('posts/updateComment', async ({ postId, commentId, text }, { rejectWithValue }) => {
    try {
        const response = await updateCommentAPI(commentId, text);
        return { postId, commentId, text };
    } catch (error) {
        console.error('Error in updateComment:', error.message);
        return rejectWithValue(error.message);
    }
});

export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
    try {
        const response = await deleteCommentAPI(commentId);
        return { postId, commentId };
    } catch (error) {
        console.error('Error in deleteComment:', error.message);
        return rejectWithValue(error.message);
    }
});

export const fetchPostDetail = createAsyncThunk('posts/fetchPostDetail', async (postId, { rejectWithValue }) => {
    try {
        const response = await fetchPostDetailAPI(postId);
        return response;
    } catch (error) {
        console.error('Error in fetchPostDetail:', error.message);
        return rejectWithValue(error.message);
    }
});


const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [], // Danh sách bài viết
        postDetail: null, // Chi tiết bài viết
        status: 'idle', // Trạng thái tải dữ liệu
        error: null, // Lỗi nếu có
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ===== Fetch All Posts =====
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // ===== Likes Post =====
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
            .addCase(likePost.fulfilled, (state, action) => {
                // Không cần xử lý thêm vì pending đã cập nhật state
            })
            .addCase(likePost.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.likes = post.likes.filter(like => like._id !== userId);
                }
                state.error = action.payload;
            })
            .addCase(unlikePost.pending, (state, action) => {
                const { postId, userId } = action.meta.arg;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.likes = post.likes.filter(like => like._id !== userId);
                }
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                // Không cần xử lý thêm vì pending đã cập nhật state
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
                state.error = action.payload;
            })

            // ===== Comments =====
            .addCase(fetchComments.fulfilled, (state, action) => {
                const { postId, comments } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments = comments;
                }
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments.push(comment);
                }
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                const { postId, commentId } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments = post.comments.filter(comment => comment._id !== commentId);
                }
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.error = action.payload;
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
            .addCase(updateComment.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ===== Likes Comment =====
            .addCase(likeComment.fulfilled, (state, action) => {
                const { postId, commentId, updatedComment } = action.payload;
                console.log('likeComment response:', updatedComment); // Debug dữ liệu từ API
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const commentIndex = post.comments.findIndex(c => c._id === commentId);
                    if (commentIndex !== -1) {
                        post.comments[commentIndex] = {
                            ...post.comments[commentIndex],
                            likes: updatedComment.likes || [],
                        };
                    }
                }
            })
            .addCase(likeComment.rejected, (state, action) => {
                console.error('Like comment rejected:', action.payload);
                state.error = action.payload;
            })
            .addCase(unlikeComment.fulfilled, (state, action) => {
                const { postId, commentId, updatedComment } = action.payload;
                console.log('unlikeComment response:', updatedComment); // Debug dữ liệu từ API
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const commentIndex = post.comments.findIndex(c => c._id === commentId);
                    if (commentIndex !== -1) {
                        post.comments[commentIndex] = {
                            ...post.comments[commentIndex],
                            likes: updatedComment.likes || [],
                        };
                    }
                }
            })
            .addCase(unlikeComment.rejected, (state, action) => {
                console.error('Unlike comment rejected:', action.payload);
                state.error = action.payload;
            })

            // ===== Fetch Post Detail =====
            .addCase(fetchPostDetail.pending, (state) => {
                state.status = 'loading';
                state.postDetail = null;
            })
            .addCase(fetchPostDetail.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.postDetail = action.payload; // Gán bài viết chi tiết
            })
            .addCase(fetchPostDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default postsSlice.reducer;