// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './post/postsSlice';
import authReducer from './auth/authSlice';
import profileReducer from './profile/profileSlice'; // Import reducer cho thông tin người dùng
import commentsReducer from './comments/commentsSlice';
import postReducer from './post/post.slice';
import notificationReducer from './notification/notificationSlice';
import userNotificationsReducer from './notification/user.notifications.slice';


export const store = configureStore({
    reducer: {
        posts: postsReducer, // Reducer cho danh sách bài viết
        post: postReducer,
        auth: authReducer,
        profile: profileReducer, // Reducer cho thông tin người dùng
        comments: commentsReducer,
        userNotifications: userNotificationsReducer,
        notification: notificationReducer
    },
});