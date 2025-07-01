import React, { useEffect } from "react";
import { formatTime } from "./CommentRefractor";
import { Avatar } from "antd";
import { useDispatch } from "react-redux";
import { markAsRead } from "../../redux/notification/user.notifications.slice";

const NotificationRefractor = ({ notification, onClick }) => {
    const dispatch = useDispatch();
    const isUnread = notification?.isRead === false;

    const handleNotificationClick = () => {
        // 1. Đánh dấu đã đọc cho notification
        dispatch(markAsRead(notification.baseId || notification._id)); // nếu có baseId tức là notification trong subset
    }

    return (
        <div
            className={`flex items-center p-3 rounded-lg my-2 cursor-pointer transition relative
                ${isUnread ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-100 hover:bg-gray-200"}
            `}
            onClick={handleNotificationClick}
        >
            <Avatar
                size={40}
                src={notification?.fromUser?.avatar || "https://i.pravatar.cc/150?u=user"}
                className="mr-3 border border-gray-200"
            />
            <div className="flex-1 min-w-0 ml-2 flex flex-col justify-start">
                <div className="flex items-baseline">
                    <span className={`font-semibold leading-tight ${isUnread ? "text-blue-900" : "text-gray-900"}`}>
                        @{notification?.fromUser?.username}
                    </span>
                    <span className={`ml-2 break-words leading-tight ${isUnread ? "text-blue-900" : "text-gray-700"}`}>
                        {notification?.message}
                    </span>
                </div>
            </div>
            <span className="ml-3 text-xs text-gray-400 absolute right-4 top-3">
                {formatTime(notification?.createdAt)}
            </span>
        </div>
    );
};
export default NotificationRefractor;