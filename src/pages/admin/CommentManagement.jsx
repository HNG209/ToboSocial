import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Popconfirm, Tag, message } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminCommentsAPI, deleteCommentByAdminAPI } from '../../services/admin.service';
import moment from 'moment';

const { Search } = Input;

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('username'); // username hoặc postCaption
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // Gọi API để lấy danh sách bình luận
    const fetchComments = async (params = {}) => {
        try {
            setLoading(true);
            const filter = searchType === 'username' ? { username: searchText } : { postCaption: searchText };
            const response = await fetchAdminCommentsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                [`filter[${searchType}]`]: searchText || undefined,
                ...params,
            });
            // Xử lý dữ liệu trả về
            const commentsData = Array.isArray(response)
                ? response
                : response.comments || [];
            setComments(commentsData);
            setTotal(response.total || commentsData.length); // Sử dụng total nếu có
        } catch (error) {
            console.error('Error fetching comments:', error);
            message.error('Lỗi khi tải danh sách bình luận');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [pagination.current, pagination.pageSize, searchText, searchType]);

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi loại tìm kiếm
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setSearchText('');
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId) => {
        try {
            await deleteCommentByAdminAPI(commentId);
            message.success('Xóa bình luận thành công');
            setComments((prev) => prev.filter((comment) => comment._id !== commentId));
            setTotal((prev) => prev - 1);
        } catch (error) {
            console.error('Error deleting comment:', error);
            message.error('Lỗi khi xóa bình luận');
        }
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: 'Tác giả',
            dataIndex: ['user', 'username'],
            key: 'author',
            sorter: (a, b) => a.user.username.localeCompare(b.user.username),
        },
        {
            title: 'Bài viết',
            dataIndex: ['post', 'caption'],
            key: 'post',
            ellipsis: true,
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Số like',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes) => likes.length,
            sorter: (a, b) => a.likes.length - b.likes.length,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc muốn xóa bình luận này?"
                    onConfirm={() => handleDeleteComment(record._id)}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button icon={<DeleteOutlined />} danger>
                        Xóa
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Quản lý bình luận</h1>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <Button
                    type={searchType === 'username' ? 'primary' : 'default'}
                    onClick={() => handleSearchTypeChange('username')}
                >
                    Tìm theo người dùng
                </Button>
                <Button
                    type={searchType === 'postCaption' ? 'primary' : 'default'}
                    onClick={() => handleSearchTypeChange('postCaption')}
                >
                    Tìm theo bài viết
                </Button>
                <Search
                    placeholder={`Tìm kiếm theo ${searchType === 'username' ? 'username' : 'caption bài viết'}`}
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ maxWidth: '400px' }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={comments}
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
        </div>
    );
};

export default CommentManagement;