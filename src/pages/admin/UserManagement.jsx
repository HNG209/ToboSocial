import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Image, Popconfirm, Tag, message } from 'antd';
import { SearchOutlined, EyeOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminUsersAPI, banUserAPI, deleteUserAPI } from '../../services/admin.service';

const { Search } = Input;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Gọi API để lấy danh sách người dùng
    const fetchUsers = async (params = {}) => {
        try {
            setLoading(true);
            const response = await fetchAdminUsersAPI({ search: searchText, ...params });
            // Thêm isBanned mặc định nếu API không trả về
            const usersWithStatus = response.map((user) => ({
                ...user,
                isBanned: user.isBanned || false, // Giả định trạng thái ban mặc định
                postCount: user.postCount || 0, // Giả định postCount nếu không có
            }));
            setUsers(usersWithStatus);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchText]);

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Xử lý khóa/mở khóa người dùng
    const handleBanUser = async (userId, isBanned) => {
        try {
            await banUserAPI(userId);
            message.success(isBanned ? 'Mở khóa người dùng thành công' : 'Khóa người dùng thành công');
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, isBanned: !isBanned } : user
                )
            );
        } catch (error) {
            console.error('Error banning user:', error);
            message.error('Lỗi khi khóa/mở khóa người dùng');
        }
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        try {
            await deleteUserAPI(userId);
            message.success('Xóa người dùng thành công');
            setUsers((prev) => prev.filter((user) => user._id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Lỗi khi xóa người dùng');
        }
    };

    // Xem chi tiết người dùng
    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'Avatar',
            dataIndex: ['profile', 'avatar'],
            key: 'avatar',
            render: (avatar) => (
                <Image src={avatar} width={40} style={{ borderRadius: '50%' }} />
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Followers',
            dataIndex: 'followers',
            key: 'followers',
            render: (followers) => followers.length,
            sorter: (a, b) => a.followers.length - b.followers.length,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isBanned',
            key: 'isBanned',
            render: (isBanned) => (
                <Tag color={isBanned ? 'red' : 'green'}>
                    {isBanned ? 'Bị khóa' : 'Hoạt động'}
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
                        title={`Bạn có chắc muốn ${record.isBanned ? 'mở khóa' : 'khóa'} người dùng này?`}
                        onConfirm={() => handleBanUser(record._id, record.isBanned)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            icon={<LockOutlined />}
                            type={record.isBanned ? 'default' : 'primary'}
                        >
                            {record.isBanned ? 'Mở khóa' : 'Khóa'}
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa người dùng này và toàn bộ dữ liệu liên quan?"
                        onConfirm={() => handleDeleteUser(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            style={{ marginLeft: 8 }}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Quản lý người dùng</h1>
            <Search
                placeholder="Tìm kiếm theo username hoặc email"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                style={{ marginBottom: '16px', maxWidth: '400px' }}
            />
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={false} // Tạm thời bỏ phân trang do API không trả về total
            />
            <Modal
                title="Chi tiết người dùng"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={600}
            >
                {selectedUser && (
                    <div>
                        <p><strong>Username:</strong> {selectedUser.username}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
                        <p><strong>Followers ({selectedUser.followers.length}):</strong></p>
                        <ul>
                            {selectedUser.followers.map((followerId) => (
                                <li key={followerId}>{followerId}</li>
                            ))}
                        </ul>
                        <p><strong>Following ({selectedUser.following.length}):</strong></p>
                        <ul>
                            {selectedUser.following.map((followingId) => (
                                <li key={followingId}>{followingId}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;