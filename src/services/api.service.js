import axios from "./axios.customize";

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

export {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
}
