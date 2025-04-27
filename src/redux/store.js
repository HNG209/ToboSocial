// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './post/postsSlice';

export const store = configureStore({
    reducer: {
        posts: postsReducer, // Reducer cho danh sách bài viết
    },
});