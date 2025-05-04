import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Image,
    Button,
    Drawer,
    Select,
    Typography,
    Divider,
    message,
    Spin,
} from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    CommentOutlined,
    WarningOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ReloadOutlined,
    EyeOutlined,
    DeleteOutlined,
    LinkOutlined,
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

// StatCard Component
const StatCard = ({ title, value, icon, variation, loading, bgColor }) => (
    <div className={`p-6 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-xl ${bgColor}`}>
        <div className="flex justify-between items-center">
            <div>
                <div className="text-sm text-white/90 font-medium">{title}</div>
                <div className="text-3xl font-bold mt-2 text-white">{loading ? <Spin /> : value.toLocaleString()}</div>
                {variation !== undefined && (
                    <div className="text-xs mt-3 flex items-center text-white/80">
                        <span className={variation >= 0 ? 'text-green-300' : 'text-red-300'}>
                            {variation >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(variation)}%
                        </span>
                        <span className="ml-1">so với trước</span>
                    </div>
                )}
            </div>
            <div className="bg-white/20 p-4 rounded-full text-white">{icon}</div>
        </div>
    </div>
);

// TopUserCard Component
const TopUserCard = ({ username, postCount }) => (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
        <div>
            <div className="font-semibold text-gray-800">{username}</div>
            <div className="text-sm text-gray-600">{postCount} bài viết</div>
        </div>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">Active</span>
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
        topActiveUsers: [],
    });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');
    const [visibleDrawer, setVisibleDrawer] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetchDashboardStatsAPI(timeFilter);
            setStats(response);
            message.success('Cập nhật dữ liệu thành công');
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeFilter]);

    const chartData = {
        labels: stats.postStats.map((item) => item._id || 'Không xác định'),
        datasets: [
            {
                label: 'Số bài viết',
                data: stats.postStats.map((item) => item.count),
                borderColor: 'hsl(221.2, 83.2%, 53.3%)',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#374151' } },
            tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#fff' },
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#6b7280' } },
            x: { ticks: { color: '#6b7280' } },
        },
    };

    const columns = [
        {
            title: 'Media',
            key: 'media',
            render: (_, record) => {
                const media = record.post.mediaFiles[0];
                return media?.type === 'image' ? (
                    <Image src={media.url || '/placeholder.svg'} width={50} height={50} className="rounded-md object-cover" />
                ) : media?.type === 'video' ? (
                    <video width="50" height="50" className="rounded-md object-cover" controls>
                        <source src={media.url} type="video/mp4" />
                    </video>
                ) : (
                    <span className="text-gray-500">Không có media</span>
                );
            },
        },
        {
            title: 'Caption',
            dataIndex: ['post', 'caption'],
            key: 'caption',
            ellipsis: true,
            render: (text) => <div className="max-w-[250px] truncate text-gray-700">{text}</div>,
        },
        {
            title: 'Tác giả',
            dataIndex: ['post', 'author', 'username'],
            key: 'author',
            render: (text) => <span className="font-medium text-gray-800">{text}</span>,
        },
        {
            title: 'Báo cáo',
            dataIndex: 'totalReports',
            key: 'totalReports',
            render: (text) => <span className="font-semibold text-red-600">{text}</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex space-x-3">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => {
                            setSelectedPost(record.post);
                            setVisibleDrawer(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePost(record.post._id)}
                    >
                        Xóa
                    </Button>
                </div>
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
            message.success('Xóa bài viết thành công');
        } catch (error) {
            console.error('Error deleting post:', error);
            message.error('Lỗi khi xóa bài viết');
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <AntTitle level={2} className="text-gray-900 font-bold">Dashboard Tổng Quan</AntTitle>
                <Button
                    type="primary"
                    onClick={fetchStats}
                    loading={loading}
                    className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 flex items-center"
                >
                    <ReloadOutlined className="mr-2" />
                    {loading ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Người dùng"
                    value={stats.userCount}
                    variation={stats.variations?.userVariation}
                    loading={loading}
                    icon={<UserOutlined className="text-2xl" />}
                    bgColor="bg-gradient-to-r from-indigo-500 to-indigo-700"
                />
                <StatCard
                    title="Bài viết"
                    value={stats.postCount}
                    variation={stats.variations?.postVariation}
                    loading={loading}
                    icon={<FileTextOutlined className="text-2xl" />}
                    bgColor="bg-gradient-to-r from-green-500 to-green-700"
                />
                <StatCard
                    title="Bình luận"
                    value={stats.commentCount}
                    variation={stats.variations?.commentVariation}
                    loading={loading}
                    icon={<CommentOutlined className="text-2xl" />}
                    bgColor="bg-gradient-to-r from-yellow-500 to-yellow-700"
                />
                <StatCard
                    title="Báo cáo"
                    value={stats.pendingReports}
                    variation={stats.variations?.reportVariation}
                    loading={loading}
                    icon={<WarningOutlined className="text-2xl" />}
                    bgColor="bg-gradient-to-r from-red-500 to-red-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 p-6 bg-white rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Hoạt động đăng bài</h2>
                        <Select
                            value={timeFilter}
                            onChange={setTimeFilter}
                            className="w-48 mt-4 sm:mt-0"
                            options={[
                                { value: '7days', label: '7 ngày qua' },
                                { value: 'month', label: 'Tháng này' },
                                { value: 'quarter', label: 'Quý này' },
                                { value: 'all', label: 'Tất cả' },
                            ]}
                        />
                    </div>
                    <div className="h-80">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Line data={chartData} options={chartOptions} />
                        )}
                    </div>
                </Card>

                <Card className="p-6 bg-white rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Người dùng hoạt động nhất</h2>
                    <div className="space-y-3">
                        {stats.topActiveUsers.length > 0 ? (
                            stats.topActiveUsers.map((user, index) => (
                                <TopUserCard key={index} username={user.username} postCount={user.postCount} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-6">Chưa có dữ liệu</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Bài viết bị báo cáo nhiều nhất</h2>
                <Table
                    columns={columns}
                    dataSource={stats.mostReportedPosts}
                    rowKey={(record) => record.post._id}
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                    className="rounded-md overflow-hidden"
                />
            </Card>

            <Drawer
                title={<span className="text-lg font-semibold">Chi tiết bài viết</span>}
                open={visibleDrawer}
                onClose={() => setVisibleDrawer(false)}
                width={450}
                className="rounded-lg"
            >
                {selectedPost && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Caption</h3>
                            <p className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-md">{selectedPost.caption}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Tác giả</h3>
                            <p className="mt-2 font-medium text-gray-800">{selectedPost.author.username}</p>
                        </div>
                        <Divider className="my-4" />
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-3">Media</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedPost.mediaFiles.map((media, index) => (
                                    <div key={index} className="rounded-lg overflow-hidden shadow-sm">
                                        {media.type === 'image' ? (
                                            <Image
                                                src={media.url || '/placeholder.svg'}
                                                alt={`Media ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                        ) : (
                                            <video src={media.url} controls className="w-full h-32 object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider className="my-4" />
                        <div className="flex justify-between">
                            <Button
                                icon={<LinkOutlined />}
                                href={`/posts/${selectedPost._id}`}
                                target="_blank"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                                Xem bài viết
                            </Button>
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => {
                                    handleDeletePost(selectedPost._id);
                                    setVisibleDrawer(false);
                                }}
                            >
                                Xóa bài viết
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Dashboard;