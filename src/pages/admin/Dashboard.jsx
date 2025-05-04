import React, { useEffect, useState } from 'react';
import {
    Card,
    Col,
    Row,
    Statistic,
    Table,
    Image,
    Button,
    Drawer,
    Select,
    Typography,
    Divider,
} from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    CommentOutlined,
    WarningOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { deletePostByAdminAPI, fetchDashboardStatsAPI } from '../../services/admin.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Title: AntTitle } = Typography;

const StatCard = ({ title, value, icon, variation, loading, bgColor }) => (
    <Card
        loading={loading}
        style={{ padding: 20, color: '#fff', background: bgColor, borderRadius: 16 }}
    >
        <Row justify="space-between" align="middle">
            <Col>
                <div style={{ fontSize: 14, opacity: 0.9 }}>{title}</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>${value}</div>
                {variation !== undefined && (
                    <div style={{ fontSize: 12 }}>
                        <span style={{ color: variation >= 0 ? '#00ff00' : '#ff4d4f' }}>
                            {variation >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(variation)}%
                        </span>{' '}
                        so với trước
                    </div>
                )}
            </Col>
            <Col>{icon}</Col>
        </Row>
    </Card>
);

const StockListCard = ({ title, value, profit }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
            <div style={{ fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, color: profit ? '#3f8600' : '#cf1322' }}>
                {profit ? '10% Profit' : '10% Loss'}
            </div>
        </div>
        <div style={{ fontWeight: 600 }}>${value}</div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        postCount: 0,
        commentCount: 0,
        pendingReports: 0,
        variations: {},
        postStats: [],
        mostReportedPosts: [],
    });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');
    const [visibleDrawer, setVisibleDrawer] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetchDashboardStatsAPI(timeFilter);
                setStats(response);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [timeFilter]);

    const chartData = {
        labels: stats.postStats.map((item) => item._id || 'Không xác định'),
        datasets: [
            {
                label: 'Số bài viết',
                data: stats.postStats.map((item) => item.count),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const columns = [
        {
            title: 'Thumbnail',
            key: 'media',
            render: (_, record) => {
                const media = record.post.mediaFiles[0];
                return media?.type === 'image' ? (
                    <Image src={media.url} width={50} />
                ) : media?.type === 'video' ? (
                    <video width="50" controls>
                        <source src={media.url} type="video/mp4" />
                    </video>
                ) : (
                    'Không có media'
                );
            },
        },
        {
            title: 'Caption',
            dataIndex: ['post', 'caption'],
            key: 'caption',
            ellipsis: true,
            render: (text) => (text?.length > 50 ? `${text.slice(0, 50)}...` : text),
        },
        {
            title: 'Tác giả',
            dataIndex: ['post', 'author', 'username'],
            key: 'author',
        },
        {
            title: 'Số báo cáo',
            dataIndex: 'totalReports',
            key: 'totalReports',
            sorter: (a, b) => a.totalReports - b.totalReports,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => {
                        setSelectedPost(record.post);
                        setVisibleDrawer(true);
                    }}>
                        Xem chi tiết
                    </Button>
                    <Button type="link" danger onClick={() => handleDeletePost(record.post._id)}>
                        Xóa
                    </Button>
                </>
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
            <AntTitle level={3}>Dashboard Tổng quan</AntTitle>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard title="Người dùng" value={stats.userCount} variation={stats.variations?.userVariation} loading={loading} icon={<UserOutlined style={{ fontSize: 32, color: '#fff' }} />} bgColor="linear-gradient(135deg, #108dc7 0%, #0073e6 100%)" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard title="Bài viết" value={stats.postCount} variation={stats.variations?.postVariation} loading={loading} icon={<FileTextOutlined style={{ fontSize: 32, color: '#fff' }} />} bgColor="linear-gradient(135deg, #52c234 0%, #061700 100%)" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard title="Bình luận" value={stats.commentCount} variation={stats.variations?.commentVariation} loading={loading} icon={<CommentOutlined style={{ fontSize: 32, color: '#fff' }} />} bgColor="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard title="Báo cáo" value={stats.pendingReports} variation={stats.variations?.reportVariation} loading={loading} icon={<WarningOutlined style={{ fontSize: 32, color: '#fff' }} />} bgColor="linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)" />
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} md={16}>
                    <Card title="Biểu đồ đăng bài">
                        <Select value={timeFilter} onChange={setTimeFilter} style={{ marginBottom: 16, width: 150 }}>
                            <Select.Option value="7days">7 ngày</Select.Option>
                            <Select.Option value="month">Tháng</Select.Option>
                            <Select.Option value="quarter">Quý</Select.Option>
                            <Select.Option value="all">Tất cả</Select.Option>
                        </Select>
                        <Line data={chartData} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Cổ phiếu phổ biến">
                        <StockListCard title="Bajaj Finery" value={1839} profit />
                        <StockListCard title="TTML" value={100} profit={false} />
                        <StockListCard title="Reliance" value={200} profit />
                        <StockListCard title="TTML" value={189} profit={false} />
                        <StockListCard title="Stolon" value={189} profit={false} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Bài viết bị báo cáo nhiều nhất" loading={loading}>
                        <Table columns={columns} dataSource={stats.mostReportedPosts} rowKey={(record) => record.post._id} pagination={{ pageSize: 5 }} />
                    </Card>
                </Col>
            </Row>

            <Drawer title="Chi tiết bài viết" open={visibleDrawer} onClose={() => setVisibleDrawer(false)} width={500}>
                {selectedPost && (
                    <>
                        <p><strong>Caption:</strong> {selectedPost.caption}</p>
                        <p><strong>Tác giả:</strong> {selectedPost.author.username}</p>
                        <Divider />
                        {selectedPost.mediaFiles.map((media, index) => (
                            media.type === 'image' ? (
                                <Image key={index} src={media.url} width={100} style={{ marginRight: 8 }} />
                            ) : (
                                <video key={index} width="100" controls style={{ marginRight: 8 }}>
                                    <source src={media.url} type="video/mp4" />
                                </video>
                            )
                        ))}
                        <Divider />
                        <Button type="primary" href={`/posts/${selectedPost._id}`} target="_blank">Xem bài viết</Button>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default Dashboard;