import React, { useEffect, useState } from 'react';
import { List, Avatar, Button, message, Typography, Space, Card, Tag, Row, Col } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getUserNotificationsAPI, markNotificationAsReadAPI, markAllNotificationsAsReadAPI } from '../../services/admin.service';
import moment from 'moment';
import styled from 'styled-components';

const { Title, Text } = Typography;

const NotificationCard = styled(Card)`
    margin-bottom: 16px;
    border-radius: 8px;
    transition: all 0.3s;
    background: ${props => (props.isRead ? '#fff' : '#f0f5ff')};
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .ant-card-body {
        padding: 16px;
    }
`;

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getUserNotificationsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
            });
            console.log('API Response:', response);

            const notificationsData = Array.isArray(response.result) ? response.result : [];
            const totalData = notificationsData.length;

            console.log('Notifications Data:', notificationsData);
            setNotifications(notificationsData);
            setTotal(totalData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Lỗi khi tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [pagination.current, pagination.pageSize]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsReadAPI(notificationId);
            message.success('Đã đánh dấu thông báo là đã xem');
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            message.error('Lỗi khi đánh dấu thông báo');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsReadAPI();
            message.success('Đã đánh dấu tất cả thông báo là đã xem');
            setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            message.error('Lỗi khi đánh dấu tất cả thông báo');
        }
    };

    const handleLoadMore = () => {
        setPagination((prev) => ({ ...prev, current: prev.current + 1 }));
    };

    console.log('Current Notifications State:', notifications);

    return (
        <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={2}>Thông báo</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.every((notif) => notif.isRead)}
                    >
                        Đánh dấu tất cả đã xem
                    </Button>
                </Col>
            </Row>
            {notifications.length === 0 && !loading ? (
                <Text>Không có thông báo nào.</Text>
            ) : (
                <List
                    loading={loading}
                    dataSource={notifications}
                    renderItem={(item) => {
                        console.log('Rendering Notification:', item);
                        return (
                            <NotificationCard isRead={item.isRead}>
                                <List.Item
                                    actions={[
                                        !item.isRead && (
                                            <Button
                                                key="mark-read"
                                                type="text"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleMarkAsRead(item._id)}
                                            >
                                                Đánh dấu đã xem
                                            </Button>
                                        ),
                                        item.relatedEntity && item.relatedEntityModel === 'post' && (
                                            <Button
                                                key="view-post"
                                                type="text"
                                                icon={<EyeOutlined />}
                                                onClick={() => window.open(`/posts/${item.relatedEntity}`, '_blank')}
                                            >
                                                Xem bài viết
                                            </Button>
                                        ),
                                    ].filter(Boolean)}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" size={48} icon={<EyeOutlined />} />}
                                        title={
                                            <Space>
                                                <Text strong={!item.isRead}>{item.title}</Text>
                                                <Tag color={item.isRead ? 'green' : 'blue'}>
                                                    {item.isRead ? 'Đã xem' : 'Chưa xem'}
                                                </Tag>
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
                        );
                    }}
                    loadMore={
                        total > notifications.length && (
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Button onClick={handleLoadMore} loading={loading}>
                                    Tải thêm
                                </Button>
                            </div>
                        )
                    }
                />
            )}
        </div>
    );
};

export default NotificationPage;