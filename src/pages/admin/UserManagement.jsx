import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Image, Popconfirm, Tag, message } from 'antd';
import { SearchOutlined, EyeOutlined, LockOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchAdminUsersAPI, banUserAPI, unbanUserAPI, deleteUserAPI, banMultipleUsersAPI, deleteMultipleUsersAPI, exportUsersAPI } from '../../services/admin.service';
import debounce from 'lodash/debounce';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [statusFilter, setStatusFilter] = useState('active');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchText,
                status: statusFilter,
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
            };
            console.log('API Params:', params);
            const response = await fetchAdminUsersAPI(params);
            console.log('API Response:', response);
            const usersWithStatus = response.users.map((user) => ({
                ...user,
                isBanned: user.role === 'banned',
                key: user._id,
            }));
            setUsers(usersWithStatus);
            setPagination((prev) => ({ ...prev, total: response.total }));
            if (usersWithStatus.length === 0) {
                message.info('Không tìm thấy người dùng phù hợp');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchText, statusFilter, pagination.current, pagination.pageSize]);

    const debouncedSearch = debounce((value) => {
        setSearchText(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, 300);

    const handleSearch = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleBanUser = async (userId, isBanned) => {
        try {
            if (isBanned) {
                await unbanUserAPI(userId);
                message.success('Mở khóa người dùng thành công');
            } else {
                await banUserAPI(userId);
                message.success('Khóa người dùng thành công');
            }
            await fetchUsers();
        } catch (error) {
            console.error('Error banning/unbanning user:', error);
            message.error('Lỗi khi khóa/mở khóa người dùng');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUserAPI(userId);
            message.success('Xóa người dùng thành công');
            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Lỗi khi xóa người dùng');
        }
    };

    const handleBanMultipleUsers = async () => {
        try {
            await banMultipleUsersAPI(selectedRowKeys);
            message.success('Khóa nhiều người dùng thành công');
            await fetchUsers();
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error banning multiple users:', error);
            message.error('Lỗi khi khóa nhiều người dùng');
        }
    };

    const handleDeleteMultipleUsers = async () => {
        try {
            await deleteMultipleUsersAPI(selectedRowKeys);
            message.success('Xóa nhiều người dùng thành công');
            await fetchUsers();
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error deleting multiple users:', error);
            message.error('Lỗi khi xóa nhiều người dùng');
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
    };

    const handleExportUsers = async () => {
        try {
            const response = await exportUsersAPI(searchText, statusFilter);
            const users = response.result;
            if (!users || users.length === 0) {
                message.info('Không có người dùng để xuất');
                return;
            }
            const csvData = [
                ['Username', 'Email', 'Full Name', 'Phone', 'Created At', 'Post Count', 'Followers', 'Following', 'Status'],
                ...users.map((user) => [
                    user.username,
                    user.email,
                    user.fullName || '',
                    user.phone || '',
                    new Date(user.createdAt).toLocaleString(),
                    user.postCount,
                    user.followers.length,
                    user.following.length,
                    user.role === 'banned' ? 'Đã khóa' : 'Hoạt động',
                ]),
            ]
                .map((row) => row.join(','))
                .join('\n');

            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `users_${statusFilter}_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success('Xuất danh sách người dùng thành công');
        } catch (error) {
            console.error('Error exporting users:', error);
            message.error('Lỗi khi xuất danh sách người dùng');
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    };

    const columns = [
        {
            title: 'Avatar',
            dataIndex: ['profile', 'avatar'],
            key: 'avatar',
            render: (avatar) => <Image src={avatar || 'default-avatar.png'} width={40} style={{ borderRadius: '50%' }} />,
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
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Bài viết',
            dataIndex: 'postCount',
            key: 'postCount',
            sorter: (a, b) => a.postCount - b.postCount,
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
                <Tag color={isBanned ? 'red' : 'green'}>{isBanned ? 'Đã khóa' : 'Hoạt động'}</Tag>
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
                        <Button icon={<DeleteOutlined />} danger style={{ marginLeft: 8 }}>
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
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm theo username hoặc email"
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    style={{ maxWidth: 400, marginRight: 16 }}
                />
                <Button
                    type={statusFilter === 'active' ? 'primary' : 'default'}
                    onClick={() => handleStatusFilter('active')}
                    style={{ marginRight: 8 }}
                >
                    Hoạt động
                </Button>
                <Button
                    type={statusFilter === 'banned' ? 'primary' : 'default'}
                    onClick={() => handleStatusFilter('banned')}
                    style={{ marginRight: 8 }}
                >
                    Đã khóa
                </Button>
                <Button
                    type={statusFilter === 'all' ? 'primary' : 'default'}
                    onClick={() => handleStatusFilter('all')}
                    style={{ marginRight: 8 }}
                >
                    Tất cả
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExportUsers}>
                    Export CSV
                </Button>
            </div>
            <div style={{ marginBottom: 16 }}>
                {selectedRowKeys.length > 0 && (
                    <>
                        <Popconfirm
                            title="Bạn có chắc muốn khóa các người dùng đã chọn?"
                            onConfirm={handleBanMultipleUsers}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="primary" icon={<LockOutlined />} style={{ marginRight: 8 }}>
                                Khóa ({selectedRowKeys.length})
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title="Bạn có chắc muốn xóa các người dùng đã chọn và toàn bộ dữ liệu liên quan?"
                            onConfirm={handleDeleteMultipleUsers}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa ({selectedRowKeys.length})
                            </Button>
                        </Popconfirm>
                    </>
                )}
            </div>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={users}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
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
                        <p><strong>Họ tên:</strong> {selectedUser.fullName || 'Chưa có'}</p>
                        <p><strong>Phone:</strong> {selectedUser.phone || 'Chưa có'}</p>
                        <p><strong>Website:</strong> {selectedUser.profile?.website || 'Chưa có'}</p>
                        <p><strong>Ngày đăng ký:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                        <p><strong>Bài viết:</strong> {selectedUser.postCount}</p>
                        <p><strong>Followers:</strong> {selectedUser.followers.length}</p>
                        <p><strong>Following:</strong> {selectedUser.following.length}</p>
                        <Button type="primary">
                            <a
                                href={`/profile/${selectedUser.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Xem trang cá nhân
                            </a>
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;