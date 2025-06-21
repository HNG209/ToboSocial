import { useEffect } from 'react';
import { notification } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../../redux/notification/notificationSlice';

// Component để đặt global placeholder cho notification
const NotificationWatcher = () => {
    const [api, contextHolder] = notification.useNotification();
    const dispatch = useDispatch();

    const notif = useSelector((state) => state.notification);

    useEffect(() => {
        if (notif.visible) {
            api.open({
                message: notif.message,
                description: notif.description,
                type: notif.type,
                showProgress: notif.showProgress,
                pauseOnHover: notif.pauseOnHover,
            });

            // Clear notification state sau khi hiển thị
            dispatch(clearNotification());
        }
    }, [notif, api, dispatch]);

    return contextHolder;
};

export default NotificationWatcher;
