import axios from "axios";
// import NProgress from 'nprogress';

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});
// NProgress.configure({
//     showSpinner: false,
//     trickleSpeed: 100,
// });

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // NProgress.start()
    // if (typeof window !== "undefined" && window && window.localStorage &&
    //     window.localStorage.getItem('access_token')) {
    //     config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    // }
    // Do something before request is sent 
    return config;
}, function (error) {
    // NProgress.done();
    // Do something with request error 
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // NProgress.done();
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // if (response.data && response.data.data) return response.data
    return response.data;
}, function (error) {
    // NProgress.done();
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response && error.response.data) return error.response.data
    return Promise.reject(error);
});

// Alter defaults after instance has been created
//   instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

export default instance