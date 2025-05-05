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
const fetchCommentsByPostAPI = (postId, page = 1, limit = 10) => { //?
    const URL_BACKEND = `/v1/api/comments?post=${postId}&page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

// Hung sua lai
const fetchPostCommentsAPI = (postId) => {
    const URL_BACKEND = `v1/api/posts/${postId}/comments`;
    return axios.get(URL_BACKEND);
}

const fetchPostCommentsAPIv2 = (postId, userId) => { //v2: có trả về trạng thái đã like bình luận của người dùng
    const URL_BACKEND = `v1/api/posts/${postId}/comments`;
    return axios.post(URL_BACKEND, { userId });
}

const fetchPostAuthorAPI = (postId) => {
    const URL_BACKEND = `v1/api/${postId}/author`;
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

const fetchPostByUserAPI = (userId, page = 1, limit = 10) => {
    const URL_BACKEND = `/v1/api//users/${userId}/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

//user api
const getUserAPI = (userId) => {
    const URL_BACKEND = `/v1/api/users/${userId}`;
    return axios.get(URL_BACKEND);
}

//update user api
const updateUserAPI = (data) => {
    const URL_BACKEND = `/v1/api/users`;
    return axios.put(URL_BACKEND, data);
}

//like API v2
const likeAPIv2 = (postId, userId, onModel) => {
    const URL_BACKEND = `/v1/api/like/${postId}`;
    return axios.post(URL_BACKEND, { userId, onModel })
}

const unlikeAPIv2 = (postId, userId, onModel) => {
    const URL_BACKEND = `/v1/api/unlike/${postId}`;
    return axios.post(URL_BACKEND, { userId, onModel })
}

const likeStatusAPIv2 = (postId, userId, onModel) => {
    const URL_BACKEND = `/v1/api/is-liked/${postId}`;
    return axios.post(URL_BACKEND, { userId, onModel })
}

const fetchLikersAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/likers/${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

const counLikeAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/like/count${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

export {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
    fetchCommentsByPostAPI,
    fetchPostCommentsAPI,
    fetchPostCommentsAPIv2,
    createCommentAPI,
    deleteCommentAPI,
    updateCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
    fetchPostDetailAPI,
    fetchPostByUserAPI,
    getUserAPI,
    updateUserAPI,
    fetchPostAuthorAPI,
    likeAPIv2,
    unlikeAPIv2,
    likeStatusAPIv2,
    fetchLikersAPIv2,
    counLikeAPIv2
};
