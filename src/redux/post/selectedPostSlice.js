import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createCommentAPI, fetchPostAuthorAPI, fetchLikersAPIv2, fetchPostCommentsAPIv2, fetchPostDetailAPI, likeStatusAPIv2, likeAPIv2, unlikeAPIv2, fetchRepliesByCommentAPI, deletePostAPI } from "../../services/api.service";

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
        const commentsResponse = await fetchPostCommentsAPIv2(postId)
        // fetch post likers
        const likersResponse = await fetchLikersAPIv2(postId, 'post')

        return { authorResponse, commentsResponse, likersResponse };
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const fetchMoreComments = createAsyncThunk('posts/fetchMoreComments', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const currentPage = state.selectedPost.page;
        const postId = state.selectedPost.post._id;
        const fetchMore = state.selectedPost.fetchMore;

        if (!fetchMore) return { commentsResponse: [], nextPage: currentPage };

        const nextPage = currentPage + 1;
        // fetch comments
        const commentsResponse = await fetchPostCommentsAPIv2(postId, nextPage)

        return { commentsResponse, nextPage };
    } catch (error) {
        console.error('Error in fetching comments:', error.message);
        return rejectWithValue(error.message);
    }
})


export const fetchPost = createAsyncThunk('posts/fetchPost', async (postId, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const postInProfile = state.profile.posts.find(post => post._id === postId);
        // fetch post, don't need to call API if viewing profile(posts already in profile context, reuse it)
        const postResponse = postInProfile || await fetchPostDetailAPI(postId)

        return postResponse;
    } catch (error) {
        console.error('Error in fetching post:', error.message);
        return rejectWithValue(error.message);
    }
});

export const fetchRepliesComment = createAsyncThunk('posts/fetchRepliesComment', async (commentId, { getState, rejectWithValue }) => {
    try {
        // lấy replyPage từ state, nếu không có thì mặc định là 1
        const state = getState();
        const replyPage = state.selectedPost.comments.find(c => c._id === commentId)?.replyPage || 1;
        if (replyPage === -1) {
            return { commentId, replies: [], replyPage: -1 }; // nếu không có bình luận trả lời thì trả về mảng rỗng
        }

        const response = await fetchRepliesByCommentAPI({ commentId, userId: getLocalStorageId() }, replyPage); // Lấy bình luận trả lời

        // nếu không có bình luận trả lời thì trả về mảng rỗng
        if (!response || response.length === 0) {
            return { commentId, replies: [], replyPage: -1 };
        }

        return { commentId, replies: response, replyPage }; // Trả về commentId và danh sách bình luận trả lời
    } catch (error) {
        console.error('Error in fetching replies comment:', error.message);
        return rejectWithValue(error.message);
    }
});

export const createComment = createAsyncThunk('posts/createComment', async (comment, { rejectWithValue }) => {
    try {

        const response = await createCommentAPI({
            ...comment,
            user: getLocalStorageId(), // Lấy userId từ localStorage
        });

        return response;
    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleLike = createAsyncThunk('posts/toggleLike', async (postId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(postId, 'post');
        if (!rs.isLiked) {
            return { postId, result: await likeAPIv2(postId, 'post') };
        }

        return { postId, result: await unlikeAPIv2(postId, 'post') };

    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const toggleCommentLike = createAsyncThunk('posts/toggleCommentLike', async (commentId, { rejectWithValue }) => {
    try {
        const rs = await likeStatusAPIv2(commentId, 'comment');

        if (!rs.isLiked) {
            return await { result: await likeAPIv2(commentId, 'comment'), root: rs.rootCommentId ? rs.rootCommentId : null };
        }

        return await { result: await unlikeAPIv2(commentId, 'comment'), root: rs.rootCommentId ? rs.rootCommentId : null };

    } catch (error) {
        console.error('Error in fetching post detail:', error.message);
        return rejectWithValue(error.message);
    }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const postId = state.selectedPost.post._id;
        const rs = await deletePostAPI(postId);

        return { rs, postId };
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
        comments: [], // danh sách bình luận của bài viết, đánh dấu đã like đối với người dùng hiện tại
        likers: [], // danh sách những người like bài viết
        status: 'idle', // Trạng thái tải dữ liệu
        page: 1, // trang bình luận
        fetchMore: true,
        isLoadingMoreComments: false,
        error: null, // Lỗi nếu có
    },
    reducers: {
        clearReplyComments: (state, action) => {
            // tìm kiếm bình luận gốc trong danh sách bình luận
            const commentIndex = state.comments.findIndex(c => c._id === action.payload);
            if (commentIndex !== -1) {
                state.comments[commentIndex].replies = []; // xóa bình luận trả lời của bình luận gốc
                state.comments[commentIndex].replyPage = 1; // reset lại trang bình luận trả lời
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.post = action.payload;
            })
            // ===== Fetch Posts by User =====
            .addCase(fetchPostDetail.pending, (state) => {
                state.comments = [];
                state.page = 1;
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            .addCase(fetchPostDetail.fulfilled, (state, action) => {
                const { authorResponse, commentsResponse, likersResponse } = action.payload;
                state.status = 'succeeded';
                state.author = authorResponse;
                state.comments = commentsResponse; // đã có trạng thái like của người dùng
                state.likers = likersResponse.users;
                state.page = 1;
                state.fetchMore = true;
            })
            .addCase(fetchPostDetail.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })

            .addCase(fetchMoreComments.pending, (state) => {
                state.isLoadingMoreComments = true;
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            // fetch more comments(page > 1)
            .addCase(fetchMoreComments.fulfilled, (state, action) => {
                const { commentsResponse, nextPage } = action.payload;

                if (commentsResponse.length === 0) {
                    state.isLoadingMoreComments = false;
                    state.fetchMore = false;
                    state.status = 'succeeded';
                    return;
                }

                // Lọc các comment đã tồn tại (theo _id)
                const existingIds = new Set(state.comments.map(c => c._id));
                const uniqueNewComments = commentsResponse.filter(c => !existingIds.has(c._id));

                state.comments = [...state.comments, ...uniqueNewComments];
                state.page = nextPage;
                state.isLoadingMoreComments = false;
                state.status = 'succeeded';
            })
            .addCase(fetchMoreComments.rejected, (state, action) => {
                state.status = 'failed'; // Đặt trạng thái thành failed
                state.error = action.payload; // Lưu lỗi nếu có
            })

            //Create comment
            .addCase(createComment.fulfilled, (state, action) => {
                // nếu trường rootComment tồn tại thì đây là bình luận trả lời, cập nhật lại bình luận gốc
                if (action.payload.rootComment) {
                    const rootCommentIndex = state.comments.findIndex(c => c._id === action.payload.rootComment);
                    if (rootCommentIndex === -1) return;
                    //cập nhật thêm trường replies để chứa bình luận trả lời
                    if (!state.comments[rootCommentIndex].replies) {
                        state.comments[rootCommentIndex].replies = [action.payload];
                    } else {
                        state.comments[rootCommentIndex].replies = [action.payload, ...state.comments[rootCommentIndex].replies];
                    }
                    state.comments[rootCommentIndex].countReply = (state.comments[rootCommentIndex].countReply || 0) + 1;
                    return; // nếu là bình luận trả lời thì không cần thêm vào danh sách bình luận gốc
                }

                state.comments = [action.payload, ...state.comments]; // nếu không có trường rootComment thì đây là bình luận gốc, thêm vào danh sách bình luận
                state.post.commentCount = (state.post.commentCount || 0) + 1; // tăng số lượng bình luận của bài viết

                state.error = null; // Reset error state
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(fetchRepliesComment.pending, (state) => {
                state.status = 'loading'; // Đặt trạng thái thành loading
            })
            //fetch replies comment
            .addCase(fetchRepliesComment.fulfilled, (state, action) => {
                const { commentId, replies, replyPage } = action.payload;
                const commentIndex = state.comments.findIndex(c => c._id === commentId);

                if (commentIndex === -1) return; // nếu không tìm thấy bình luận thì không cần cập nhật

                // nếu replyPage là -1 thì không có bình luận trả lời, không cần cập nhật
                if (replies.length === 0 || replyPage === -1) {
                    state.comments[commentIndex].replyPage = -1; // đánh dấu không có bình luận trả lời
                    return;
                }

                state.comments[commentIndex].replies = [...(state.comments[commentIndex].replies || []), ...replies]; // cập nhật bình luận trả lời
                // // loại bỏ các bình luận trùng lặp trong replies
                const uniqueReplies = Array.from(new Set(state.comments[commentIndex].replies.map(r => r._id)))
                    .map(id => state.comments[commentIndex].replies.find(r => r._id === id));
                state.comments[commentIndex].replies = uniqueReplies; // cập nhật lại bình luận trả lời với các bình luận không trùng lặp
                // state.comments[commentIndex].countReply = (state.comments[commentIndex].countReply || 0) + replies.length; // cập nhật số lượng bình luận trả lời

                //thêm trường replyPage để quản lý phân trang của bình luận trả lời
                state.comments[commentIndex].replyPage = replyPage + 1; // tăng replyPage lên 1 để lần sau gọi sẽ lấy trang tiếp theo

                state.status = 'succeeded'; // Đặt trạng thái thành succeeded
            })

            //toggle post like
            .addCase(toggleLike.fulfilled, (state, action) => {
                state.post.isLiked = action.payload.result.isLiked;
                if (state.post) {
                    state.post.likeCount = action.payload.result.isLiked ? state.post.likeCount + 1 : state.post.likeCount - 1;
                }
            })

            //toggle comment like
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                const { result, root } = action.payload;

                // nếu có root
                if (root) {
                    const rootCommentIndex = state.comments.findIndex(c => c._id === root);
                    if (rootCommentIndex === -1) return;
                    // nếu có bình luận trả lời
                    if (!state.comments[rootCommentIndex].replies) return;
                    // tìm id của bình luận trả lời qua trường result.targetId
                    const replyIndex = state.comments[rootCommentIndex].replies.findIndex(r => r._id === result.targetId);
                    // cập nhật trạng thái đã like của bình luận trả lời
                    if (replyIndex !== -1) {
                        state.comments[rootCommentIndex].replies[replyIndex].isLiked = result.isLiked;
                    }

                }
                else {
                    // nếu không có root, cập nhật trạng thái đã like của bình luận gốc
                    const commentIndex = state.comments.findIndex(c => c._id === result.targetId);
                    if (commentIndex !== -1) {
                        state.comments[commentIndex].isLiked = result.isLiked;
                    }
                }
            })

            .addCase(deletePost.fulfilled, (state, action) => {
            })
    }
})

export const { clearReplyComments } = selectedPostSlice.actions;
export default selectedPostSlice.reducer;