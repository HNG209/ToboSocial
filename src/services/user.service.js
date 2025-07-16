// user.service.js
import axios from "./axios.customize";

// Đăng nhập
const loginAPI = async (username, password) => {
    const URL_BACKEND = `/v1/api/login`;
    return axios.post(URL_BACKEND, { username, password });
};

// Đăng ký
const registerAPI = async (username, email, password, fullName) => {
    const URL_BACKEND = `/v1/api/users/register`;
    return axios.post(URL_BACKEND, { username, email, password, fullName });
};

// Đăng xuất
const logoutAPI = () => {
    const URL_BACKEND = `/v1/api/logout`;
    return axios.post(URL_BACKEND);
};

// Quên mật khẩu
const forgotPasswordAPI = (email) => {
    const URL_BACKEND = `/v1/api/users/forgot-password`;
    return axios.post(URL_BACKEND, { email });
};

// API theo dõi người dùng
const followUserAPI = (targetUserId, currentUserId) => {
    const URL = `/v1/api/users/${targetUserId}/follow`;
    return axios.post(URL, { userId: currentUserId })
        .then(response => {
            // Trả về toàn bộ response từ API (bao gồm message và user)
            return response;
        })
        .catch(error => {
            throw error; // Ném lỗi để Redux Toolkit xử lý
        });
};

// API bỏ theo dõi người dùng
const unfollowUserAPI = (targetUserId, currentUserId) => {
    const URL = `/v1/api/users/${targetUserId}/unfollow`;
    return axios.post(URL, { userId: currentUserId })
        .then(response => {
            // Trả về toàn bộ response từ API (bao gồm message và user)
            return response;
        })
        .catch(error => {
            throw error; // Ném lỗi để Redux Toolkit xử lý
        });
};

const searchUsersAPI = (query) => {
    const URL = `/v1/api/search?q=${encodeURIComponent(query)}`;
    return axios.get(URL);
};
const getUserByUsernameAPI = (username) => {
    const URL = `/v1/api/by-username/${encodeURIComponent(username)}`;
    return axios.get(URL);
};

const getUserPostsAPI = (userId, page = 1, limit = 10) => {
    const URL = `/v1/api/${userId}/posts?page=${page}&limit=${limit}`;
    return axios.get(URL); // interceptor sẽ trả ra response.result
};

export {
    loginAPI,
    registerAPI,
    logoutAPI,
    forgotPasswordAPI,
    followUserAPI,
    unfollowUserAPI,
    searchUsersAPI, getUserByUsernameAPI, getUserPostsAPI
};