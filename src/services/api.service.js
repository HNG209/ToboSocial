import axios from "./axios.customize";

const fetchPostsAPI = (page, limit) => {
    const URL_BACKEND = `/v1/api/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

export {
    fetchPostsAPI,
}