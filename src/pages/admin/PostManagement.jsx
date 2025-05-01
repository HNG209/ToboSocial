import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Image, Popconfirm, Tag, message, DatePicker } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminPostsAPI, deletePostByAdminAPI, restorePostByAdminAPI } from '../../services/admin.service';
import moment from 'moment';

const { Search } = Input;
const { RangePicker } = DatePicker;

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchPosts = async (params = {}) => {
        try {
            setLoading(true);
            const apiParams = {
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                filter: {
                    username: searchText ? searchText : undefined,
                    dateRange: {
                        startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
                        endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
                    },
                    deleted:
                        statusFilter === 'all' || statusFilter === 'reported'
                            ? undefined
                            : statusFilter === 'active'
                                ? 'false'
                                : 'true',
                    reported: statusFilter === 'reported' ? 'true' : undefined, // Thêm reported
                },
                ...params,
            };
            const response = await fetchAdminPostsAPI(apiParams);
            const postsData = Array.isArray(response) ? response : response.posts || [];
            const postsWithStatus = postsData.map((post) => ({
                ...post,
                deleted: post.deleted || false,
                comments: post.comments || [],
                likes: post.likes || [],
            }));
            setPosts(postsWithStatus);
            setTotal(response.total || postsData.length);
        } catch (error) {
            console.error('Error fetching posts:', error.response?.data || error.message);
            message.error('Lỗi khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [pagination.current, pagination.pageSize, searchText, dateRange, statusFilter]);

    const handleSearch = (value) => {
        const trimmedValue = value?.trim();
        setSearchText(trimmedValue || '');
        setPagination({ ...pagination, current: 1 });
    };

    const handleDateChange = (dates) => {
        setDateRange(dates || []);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleDeletePost = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            if (!post) throw new Error('Không tìm thấy bài viết');

            if (post.deleted) {
                await restorePostByAdminAPI(postId);
                message.success('Khôi phục bài viết thành công');
            } else {
                await deletePostByAdminAPI(postId);
                message.success('Xóa bài viết thành công');
            }

            fetchPosts();
        } catch (error) {
            console.error('Error handling post:', error.response?.data || error.message);
            message.error(error.response?.data?.message || 'Lỗi khi xử lý bài viết');
        }
    };

    const handleViewDetails = (post) => {
        setSelectedPost(post);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedPost(null);
    };

    const columns = [
        {
            title: 'Thumbnail',
            dataIndex: 'mediaFiles',
            key: 'thumbnail',
            render: (mediaFiles) => {
                const media = mediaFiles[0];
                if (media?.type === 'image') return <Image src={media.url} width={50} />;
                if (media?.type === 'video') return (
                    <video width="50" controls>
                        <source src={media.url} type="video/mp4" />
                    </video>
                );
                return 'Không có media';
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'caption',
            key: 'caption',
            ellipsis: true,
        },
        {
            title: 'Tác giả',
            dataIndex: ['author', 'username'],
            key: 'author',
            sorter: (a, b) => a.author.username.localeCompare(b.author.username),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'deleted',
            key: 'deleted',
            render: (deleted, record) => {
                if (statusFilter === 'reported') {
                    return <Tag color="orange">Đang bị báo cáo</Tag>;
                }
                return (
                    <Tag color={deleted ? 'red' : 'green'}>
                        {deleted ? 'Đã ẩn' : 'Hiển thị'}
                    </Tag>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        style={{ marginRight: 8 }}
                    >
                        Chi tiết
                    </Button>
                    <Popconfirm
                        title={`Bạn có chắc muốn ${record.deleted ? 'hiển thị lại' : 'ẩn'} bài viết này?`}
                        onConfirm={() => handleDeletePost(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger={!record.deleted}
                        >
                            {record.deleted ? 'Hiển thị' : 'Ẩn/Xóa'}
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Quản lý bài viết</h1>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <Search
                    placeholder="Tìm kiếm theo username tác giả"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ maxWidth: '400px' }}
                />
                <RangePicker
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                />
                <div>
                    <Button
                        type={statusFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => setStatusFilter('all')}
                        style={{ marginRight: 8 }}
                    >
                        Tất cả
                    </Button>
                    <Button
                        type={statusFilter === 'active' ? 'primary' : 'default'}
                        onClick={() => setStatusFilter('active')}
                        style={{ marginRight: 8 }}
                    >
                        Đang hiển thị
                    </Button>
                    <Button
                        type={statusFilter === 'deleted' ? 'primary' : 'default'}
                        onClick={() => setStatusFilter('deleted')}
                        style={{ marginRight: 8 }}
                    >
                        Đã bị xóa
                    </Button>
                    <Button
                        type={statusFilter === 'reported' ? 'primary' : 'default'}
                        onClick={() => setStatusFilter('reported')}
                    >
                        Đang bị báo cáo
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={posts}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total,
                    showSizeChanger: true,
                }}
                onChange={handleTableChange}
            />
            <Modal
                title="Chi tiết bài viết"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedPost && (
                    <div>
                        <p><strong>Tiêu đề:</strong> {selectedPost.caption}</p>
                        <p><strong>Tác giả:</strong> {selectedPost.author.username}</p>
                        <p><strong>Ngày tạo:</strong> {moment(selectedPost.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        <p><strong>Số lượt thích:</strong> {selectedPost.likes.length}</p>
                        <p><strong>Số bình luận:</strong> {selectedPost.comments.length}</p>
                        <p><strong>Media:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {selectedPost.mediaFiles.map((media, index) => (
                                <div key={index}>
                                    {media.type === 'image' ? (
                                        <Image src={media.url} width={200} />
                                    ) : (
                                        <video width={200} controls>
                                            <source src={media.url} type="video/mp4" />
                                        </video>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PostManagement;