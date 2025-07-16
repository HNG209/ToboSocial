import axios from "axios";
import { reject } from "lodash";
import { refreshTokenAPI } from "./auth.service";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true // nếu dùng cookie refreshToken
});

// Biến cờ để ngăn chặn nhiều request làm mới token cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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
},
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return instance(originalRequest);
                }).catch(error => {
                    return Promise.reject(error);
                })
            }

            isRefreshing = true;

            try {
                const response = await axios.get('http://localhost:8081/v1/api/auth/refresh', { withCredentials: true });
                console.log('toi day');

                const newAccessToken = response.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                processQueue(null, newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
            }
            catch (error) {
                console.error('Không thể làm mới token:', error);
                // Xử lý tất cả các request đang chờ trong hàng đợi bằng cách từ chối
                processQueue(error);
                // Chuyển hướng người dùng đến trang đăng nhập nếu làm mới token thất bại
                // localStorage.removeItem('accessToken'); // Xóa token cũ
                // window.location.href = '/login'; // Chuyển hướng
                return Promise.reject(error);
            }
            finally {
                isRefreshing = false;
            }
        }

        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    });

export default instance;
