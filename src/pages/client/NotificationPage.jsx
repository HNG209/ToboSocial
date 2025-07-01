import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Thêm useSelector
import { List, Avatar, Button, message, Typography, Space, Card, Tag, Row, Col } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getUserNotificationsAPI, markNotificationAsReadAPI, markAllNotificationsAsReadAPI } from '../../services/admin.service';
import moment from 'moment';
import styled from 'styled-components';
import { formatTime } from '../../components/refractor/CommentRefractor';
import NotificationRefractor from '../../components/refractor/NotificationRefractor';
import { fetchMoreNotifications } from '../../redux/notification/user.notifications.slice';

const { Text } = Typography;

const NotificationContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
    background: #f5f5f5;
    min-height: 100vh;
`;

const Header = styled(Row)`
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    position: sticky;
    top: 0;
    z-index: 1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const NotificationPage = () => {
    // const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const dispatch = useDispatch();

    const handleLoadMore = async () => {
        dispatch(fetchMoreNotifications());
    };

    const notifications = useSelector(state => state.userNotifications.notifications);
    const loadingStatus = useSelector(state => state.userNotifications.status);
    const more = useSelector(state => state.userNotifications.fetchMore);

    useEffect(() => {
        if (loadingStatus === 'loading')
            setLoadingMore(true)
        else setLoadingMore(false);
    }, [loadingStatus])

    const handleMarkAllAsRead = async () => {

    };

    return (
        <NotificationContainer>
            <Header justify="space-between" align="middle">
                <Col>
                    <Text strong style={{ fontSize: 20 }}>Thông Báo</Text>
                </Col>
                <Col>
                    <Button
                        type="link"
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.length === 0 || notifications.every(notif => notif.isRead)}
                        loading={loading}
                        style={{ padding: 0 }}
                    >
                        Đánh dấu tất cả đã xem
                    </Button>
                </Col>
            </Header>

            {notifications.length === 0 && !loading ? (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
                    Không có thông báo nào
                </Text>
            ) : (
                <List
                    loading={loading}
                    dataSource={notifications}
                    renderItem={item => (
                        <NotificationRefractor
                            notification={item}
                        />
                    )}
                    loadMore={
                        (notifications.length >= 10 && more) ? (
                            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                                <Button
                                    onClick={handleLoadMore}
                                    loading={loadingMore}
                                    type="default"
                                >
                                    Tải thêm
                                </Button>
                            </div>
                        ) : (
                            <div className='text-center text-xs text-gray-400'>
                                đã hết thông báo để tải
                            </div>
                        )
                    }
                />
            )}
        </NotificationContainer>
    );
};

export default NotificationPage;