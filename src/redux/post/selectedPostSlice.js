import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createCommentAPI, fetchPostAuthorAPI, fetchLikersAPIv2, fetchPostCommentsAPIv2, fetchPostDetailAPI, likeStatusAPIv2, likeAPIv2, unlikeAPIv2, fetchRepliesByCommentAPI } from "../../services/api.service";

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
        const commentsResponse = await fetchPostCommentsAPIv2(postId, getLocalStorageId(), nextPage)

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

export const fetchRepliesComment = createAsyncThunk('posts/fetchRepliesComment', async (commentId, { rejectWithValue }) => {
    try {
        const response = await fetchRepliesByCommentAPI({ commentId, userId: getLocalStorageId() }); // Lấy bình luận trả lời
        return { commentId, replies: response }; // Trả về commentId và danh sách bình luận trả lời
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
            return await { result: await likeAPIv2(commentId, getLocalStorageId(), 'comment'), root: rs.rootCommentId ? rs.rootCommentId : null };
        }

        return await { result: await unlikeAPIv2(commentId, getLocalStorageId(), 'comment'), root: rs.rootCommentId ? rs.rootCommentId : null };

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
    reducers: {},
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
                state.comments = [...state.comments, action.payload];
                // nếu trường rootComment tồn tại thì đây là bình luận trả lời, cập nhật lại bình luận gốc
                if (action.payload.rootComment) {
                    const rootCommentIndex = state.comments.findIndex(c => c._id === action.payload.rootComment);
                    if (rootCommentIndex !== -1) {
                        // state.comments[rootCommentIndex].replyCount = (state.comments[rootCommentIndex].replyCount || 0) + 1;
                        //cập nhật thêm trường replies để chứa bình luận trả lời
                        if (!state.comments[rootCommentIndex].replies) {
                            state.comments[rootCommentIndex].replies = [action.payload];
                        } else {
                            state.comments[rootCommentIndex].replies = [...state.comments[rootCommentIndex].replies, action.payload];
                        }
                    }
                }
                state.error = null; // Reset error state
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload;
            })

            //fetch replies comment
            .addCase(fetchRepliesComment.fulfilled, (state, action) => {
                const { commentId, replies } = action.payload;
                const commentIndex = state.comments.findIndex(c => c._id === commentId);
                if (commentIndex !== -1) {
                    state.comments[commentIndex].replies = replies;
                    //thêm trường replyPage để quản lý phân trang của bình luận trả lời
                    state.comments[commentIndex].replyPage = 1;
                }
                // console.log(action.payload);
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
    }
})

export default selectedPostSlice.reducer;