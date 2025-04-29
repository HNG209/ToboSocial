import axios from "./axios.customize";


// Đăng nhập
const loginAPI = (email, password) => {
    const URL_BACKEND = `/v1/api/users/login`;
    return axios.post(URL_BACKEND, { email, password });
};

// Đăng ký
const registerAPI = (username, email, password, fullName) => {
    const URL_BACKEND = `/v1/api/users/register`;
    return axios.post(URL_BACKEND, { username, email, password, fullName });
};

// Đăng xuất
const logoutAPI = () => {
    const URL_BACKEND = `/v1/api/users/logout`;
    return axios.post(URL_BACKEND);
};

// Quên mật khẩu
const forgotPasswordAPI = (email) => {
    const URL_BACKEND = `/v1/api/users/forgot-password`;
    return axios.post(URL_BACKEND, { email });
};

export {
    loginAPI,
    registerAPI,
    logoutAPI,
    forgotPasswordAPI
};
