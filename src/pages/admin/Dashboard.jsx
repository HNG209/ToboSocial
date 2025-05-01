import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Image } from 'antd';
import { UserOutlined, FileTextOutlined, CommentOutlined, WarningOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { deletePostByAdminAPI, fetchDashboardStatsAPI } from '../../services/admin.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        postCount: 0,
        commentCount: 0,
        pendingReports: 0,
        postStats: [],
        mostReportedPosts: [],
    });
    const [loading, setLoading] = useState(true);

    // Gọi API để lấy dữ liệu
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetchDashboardStatsAPI();
                setStats(response); // Lấy dữ liệu từ result
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Xử lý dữ liệu cho biểu đồ
    const chartData = {
        labels: stats.postStats.map((item) => item._id || 'Không xác định'), // Xử lý _id null
        datasets: [
            {
                label: 'Số bài viết',
                data: stats.postStats.map((item) => item.count),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    // Cấu hình bảng bài viết bị báo cáo nhiều nhất
    const columns = [
        {
            title: 'ID Bài viết',
            dataIndex: ['post', '_id'],
            key: '_id',
        },
        {
            title: 'Tiêu đề',
            dataIndex: ['post', 'caption'],
            key: 'caption',
        },
        {
            title: 'Số báo cáo',
            dataIndex: 'totalReports',
            key: 'totalReports',
            sorter: (a, b) => a.totalReports - b.totalReports,
        },
        {
            title: 'Hình ảnh/Video',
            key: 'media',
            render: (_, record) => {
                const media = record.post.mediaFiles[0]; // Lấy file media đầu tiên
                if (media.type === 'image') {
                    return <Image src={media.url} width={50} />;
                } else if (media.type === 'video') {
                    return (
                        <video width="50" controls>
                            <source src={media.url} type="video/mp4" />
                        </video>
                    );
                }
                return 'Không có media';
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <a onClick={() => handleDeletePost(record.post._id)}>Xóa</a>
            ),
        },
    ];

    const handleDeletePost = async (postId) => {
        try {
            await deletePostByAdminAPI(postId);
            setStats((prev) => ({
                ...prev,
                mostReportedPosts: prev.mostReportedPosts.filter((post) => post.post._id !== postId),
            }));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Tổng quan</h1>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tổng người dùng"
                            value={stats.userCount}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tổng bài viết"
                            value={stats.postCount}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tổng bình luận"
                            value={stats.commentCount}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Báo cáo chờ xử lý"
                            value={stats.pendingReports}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col xs={24} md={12}>
                    <Card title="Biểu đồ đăng bài theo thời gian" loading={loading}>
                        <Line data={chartData} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Bài viết bị báo cáo nhiều nhất" loading={loading}>
                        <Table
                            columns={columns}
                            dataSource={stats.mostReportedPosts}
                            rowKey={(record) => record.post._id}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;