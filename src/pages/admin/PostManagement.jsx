import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Image, Popconfirm, Tag, message, DatePicker } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminPostsAPI, deletePostByAdminAPI } from '../../services/admin.service';
import moment from 'moment';

const { Search } = Input;
const { RangePicker } = DatePicker;

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Gọi API để lấy danh sách bài viết
    const fetchPosts = async (params = {}) => {
        try {
            setLoading(true);
            const response = await fetchAdminPostsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                'filter[username]': searchText || undefined,
                'filter[dateRange][startDate]': dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
                'filter[dateRange][endDate]': dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
                ...params,
            });
            // Xử lý dữ liệu trả về
            const postsData = Array.isArray(response)
                ? response
                : response.posts || [];
            const postsWithStatus = postsData.map((post) => ({
                ...post,
                deleted: post.deleted || false,
                comments: post.comments || [],
            }));
            setPosts(postsWithStatus);
            setTotal(response.total || postsData.length); // Sử dụng total nếu có
        } catch (error) {
            console.error('Error fetching posts:', error);
            message.error('Lỗi khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [pagination.current, pagination.pageSize, searchText, dateRange]);

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý lọc theo thời gian
    const handleDateChange = (dates) => {
        setDateRange(dates || []);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    // Xử lý xóa/ẩn bài viết
    const handleDeletePost = async (postId) => {
        try {
            await deletePostByAdminAPI(postId);
            message.success('Xóa bài viết thành công');
            setPosts((prev) => prev.filter((post) => post._id !== postId));
            setTotal((prev) => prev - 1);
        } catch (error) {
            console.error('Error deleting post:', error);
            message.error('Lỗi khi xóa bài viết');
        }
    };

    // Xem chi tiết bài viết
    const handleViewDetails = (post) => {
        setSelectedPost(post);
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedPost(null);
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'Thumbnail',
            dataIndex: 'mediaFiles',
            key: 'thumbnail',
            render: (mediaFiles) => {
                const media = mediaFiles[0];
                if (media?.type === 'image') {
                    return <Image src={media.url} width={50} />;
                } else if (media?.type === 'video') {
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
            render: (deleted) => (
                <Tag color={deleted ? 'red' : 'green'}>
                    {deleted ? 'Đã ẩn' : 'Hiển thị'}
                </Tag>
            ),
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
                        <p><strong>Media:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {selectedPost.mediaFiles.map((media, index) => (
                                <div key={index}>
                                    {media.type === 'image' ? (
                                        <Image src={media.url} width={200} />
                                    ) : (
                                        <video width="200" controls>
                                            <source src={media.url} type="video/mp4" />
                                        </video>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p><strong>Bình luận ({selectedPost.comments.length}):</strong></p>
                        <ul>
                            {selectedPost.comments.length > 0 ? (
                                selectedPost.comments.map((commentId) => (
                                    <li key={commentId}>Comment ID: {commentId}</li>
                                ))
                            ) : (
                                <li>Không có bình luận</li>
                            )}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PostManagement;