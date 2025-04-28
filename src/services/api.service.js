import axios from "./axios.customize";

// Post APIs
const fetchPostsAPI = (page, limit) => {
    const URL_BACKEND = `/v1/api/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const likePostAPI = (postId, userId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}/like`;
    return axios.post(URL_BACKEND, { userId });
}

const unlikePostAPI = (postId, userId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}/unlike`;
    return axios.post(URL_BACKEND, { userId });
}

// Comment APIs
const fetchCommentsByPostAPI = (postId, page = 1, limit = 10) => {
    const URL_BACKEND = `/v1/api/comments?post=${postId}&page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const createCommentAPI = (postId, userId, text) => {
    const URL_BACKEND = `/v1/api/comments`;
    return axios.post(URL_BACKEND, { post: postId, user: userId, text });
}

const updateCommentAPI = (commentId, text) => {
    const URL_BACKEND = `/v1/api/comments/${commentId}`;
    return axios.patch(URL_BACKEND, { text });
}

const likeCommentAPI = (commentId, userId) => {
    const URL_BACKEND = `/v1/api/like-comment`;
    return axios.post(URL_BACKEND, { commentId, userId });
}

const unlikeCommentAPI = (commentId, userId) => {
    const URL_BACKEND = `/v1/api/unlike-comment`;
    return axios.post(URL_BACKEND, { commentId, userId });
}

const deleteCommentAPI = (commentId) => {
    const URL_BACKEND = `/v1/api/comments`;
    return axios.delete(URL_BACKEND, { data: { id: commentId } });
}

const fetchPostDetailAPI = (postId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}`;
    return axios.get(URL_BACKEND);
}


export {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
    fetchCommentsByPostAPI,
    createCommentAPI,
    deleteCommentAPI,
    updateCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
    fetchPostDetailAPI
};
