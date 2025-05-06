import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Thêm useSelector
import { List, Avatar, Button, message, Typography, Space, Card, Tag, Row, Col } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getUserNotificationsAPI, markNotificationAsReadAPI, markAllNotificationsAsReadAPI } from '../../services/admin.service';
import moment from 'moment';
import styled from 'styled-components';

const { Text } = Typography;

const NotificationContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
    background: #f5f5f5;
    min-height: 100vh;
`;

const NotificationCard = styled(Card)`
    margin-bottom: 8px;
    border-radius: 10px;
    border: none;
    background: ${props => (props.isRead ? '#fff' : '#f9fcff')};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    &:hover {
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
    .ant-card-body {
        padding: 12px 16px;
    }
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
    const [notifications, setNotifications] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const userId = useSelector((state) => state.auth.user?._id);


    const fetchNotifications = async () => {
        if (!userId) {
            message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setLoading(true);
            const response = await getUserNotificationsAPI({
                userId,
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
            });

            // Debug response
            console.log('API Response:', response);

            // Xử lý response là mảng trực tiếp do axios.customize.js unwrap result
            const notificationsData = Array.isArray(response) ? response : [];
            setNotifications(prev =>
                pagination.current === 1 ? notificationsData : [...prev, ...notificationsData]
            );
            // Vì response không có total, tạm dùng length. Nếu backend trả total, cần điều chỉnh
            setTotal(notificationsData.length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error(error.message || 'Lỗi khi tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [pagination.current, pagination.pageSize, userId]); // Thêm userId vào dependency

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsReadAPI(notificationId);
            message.success('Đã đánh dấu thông báo là đã xem');
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            message.error(error.message || 'Lỗi khi đánh dấu thông báo');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) {
            message.error('Không tìm thấy thông tin người dùng.');
            return;
        }

        try {
            console.log(userId);

            await markAllNotificationsAsReadAPI(userId); // Gửi userId
            message.success('Đã đánh dấu tất cả thông báo là đã xem');
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        } catch (error) {
            message.error(error.message || 'Lỗi khi đánh dấu tất cả thông báo');
        }
    };

    const handleLoadMore = () => {
        setPagination(prev => ({ ...prev, current: prev.current + 1 }));
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
                        <NotificationCard isRead={item.isRead}>
                            <List.Item
                                actions={[
                                    !item.isRead && (
                                        <Button
                                            key="mark-read"
                                            type="text"
                                            size="small"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleMarkAsRead(item._id)}
                                            disabled={loading}
                                            style={{ color: '#1890ff' }}
                                        >
                                            Đã xem
                                        </Button>
                                    ),
                                    item.relatedEntity && item.relatedEntityModel === 'post' && (
                                        <Button
                                            key="view-post"
                                            type="text"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => window.open(`/posts/${item.relatedEntity}`, '_blank')}
                                            style={{ color: '#1890ff' }}
                                        >
                                            Xem
                                        </Button>
                                    ),
                                ].filter(Boolean)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            size={40}
                                            style={{
                                                backgroundColor: item.isRead ? '#e8ecef' : '#1890ff',
                                                color: '#fff',
                                            }}
                                        >
                                            {item.type === 'warning' ? '⚠️' : '🔔'}
                                        </Avatar>
                                    }
                                    title={
                                        <Space>
                                            <Text strong={!item.isRead}>{item.title}</Text>
                                            {!item.isRead && (
                                                <Tag color="blue" style={{ borderRadius: '12px' }}>
                                                    Mới
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Text>{item.message}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {moment(item.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        </NotificationCard>
                    )}
                    loadMore={
                        total > notifications.length && (
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Button
                                    onClick={handleLoadMore}
                                    loading={loading}
                                    disabled={loading}
                                    style={{ borderRadius: '20px', padding: '4px 20px' }}
                                >
                                    Tải thêm
                                </Button>
                            </div>
                        )
                    }
                />
            )}
        </NotificationContainer>
    );
};

export default NotificationPage;