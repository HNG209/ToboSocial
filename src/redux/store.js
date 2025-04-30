// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './post/postsSlice';
import authReducer from './auth/authSlice';
import profileReducer from './profile/profileSlice'; // Import reducer cho thông tin người dùng


export const store = configureStore({
    reducer: {
        posts: postsReducer, // Reducer cho danh sách bài viết
        auth: authReducer,
        profile: profileReducer, // Reducer cho thông tin người dùng
    },
});