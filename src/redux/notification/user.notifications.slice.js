import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuthUser } from "../auth/authSlice";
import { fetchMoreNotificationsAPI, markAsReadAPI } from "../../services/notification.service";

// Đánh dấu bình luận đã đọc
export const markAsRead = createAsyncThunk(
    'userNotifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await markAsReadAPI(notificationId);
            return notificationId;
        } catch (error) {
            console.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Tải thêm thông báo cũ hơn
export const fetchMoreNotifications = createAsyncThunk(
    'userNotifications/fetchMoreNotifications',
    async (_, {getState, rejectWithValue }) => {
        try {
            const state = getState();
            const page = state.userNotifications.page || 2;
            const fetchMore = state.userNotifications.fetchMore;

            if(!fetchMore) return [];

            return await fetchMoreNotificationsAPI(page);
        } catch (error) {
            console.error(error.message);
            return rejectWithValue(error.message);
        }
    }
)

// state lưu trữ thông báo hiện tại của người dùng, refresh => lấy 10 thông báo mới nhất trong subset của user
const userNotificationsSlice = createSlice({
    name: 'userNotifications',
    initialState: {
        notifications: [],
        unRead: 0,
        page: 2,
        fetchMore: true,
        status: 'idle'
    },
    reducers: {
        appendNotification: (state, action) => {
            state.notifications = [action.payload, ...state.notifications];
            state.unRead++;
        }
    },
    extraReducers: (builder) => {
        builder
            // lắng nghe bên auth slice, khi fecth user sẽ có sẵn subset notification, không cần phải fetch riêng nữa
            .addCase(getAuthUser.fulfilled, (state, action) => {
                state.notifications = action.payload.latestNotifications; // subset của user hiện tại đang đăng nhập
                state.unRead = action.payload.unRead;
            })

            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(i => i.baseId === action.payload.toString());

                if (index === -1) return;

                state.notifications[index].isRead = true;
                state.unRead--;
            })


            .addCase(fetchMoreNotifications.pending, (state, action) => {
                state.status = 'loading' // hiển thị trực quan lên UI
            })
            .addCase(fetchMoreNotifications.fulfilled, (state, action) => {
                state.status = 'success'
                if(action.payload.length === 0) {
                    state.fetchMore = false;
                    return;
                }
                state.notifications = [...state.notifications, ...action.payload];
                state.page++;
            })
    }
})

export const { appendNotification } = userNotificationsSlice.actions;
export default userNotificationsSlice.reducer;