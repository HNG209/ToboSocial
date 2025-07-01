import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true // nếu dùng cookie refreshToken
});

// Kích hoạt khi client gửi request
instance.interceptors.request.use(config => {
    // tự động thêm accessToken vào header Authorization nếu có
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Kích hoạt khi server gửi response
instance.interceptors.response.use(function (response) {
    if (response.data && response.data.errorCode === 0) {
        return response.data.result;
    }
    return Promise.reject(response.data);
}, function (error) {
    if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
});

export default instance;
