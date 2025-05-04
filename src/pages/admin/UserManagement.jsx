import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Popconfirm,
    Tag,
    message,
    Avatar,
    Card,
    Tabs,
    Tooltip,
    Space,
    Statistic,
    Flex,
    Skeleton,
    Empty,
    Dropdown,
    Progress,
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    LockOutlined,
    DeleteOutlined,
    UserOutlined,
    ReloadOutlined,
    UnlockOutlined,
    ExportOutlined,
    TeamOutlined,
    CopyOutlined,
    EllipsisOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import confetti from 'canvas-confetti';
import 'animate.css';

import {
    fetchAdminUsersAPI,
    banUserAPI,
    unbanUserAPI,
    deleteUserAPI,
    banMultipleUsersAPI,
    deleteMultipleUsersAPI,
    exportUsersAPI,
} from '../../services/admin.service';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        newUsersToday: 0,
    });
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} người dùng`,
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [statusFilter, setStatusFilter] = useState('active');

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetchAdminUsersAPI({ status: 'all', limit: 1000 });
            const users = response.users.map((user) => ({
                ...user,
                isBanned: user.role === 'banned',
            }));
            const activeUsers = users.filter((user) => !user.isBanned).length;
            const bannedUsers = users.filter((user) => user.isBanned).length;
            const isToday = (date) => {
                const today = new Date();
                const d = new Date(date);
                return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            };
            const newUsersToday = users.filter((user) => isToday(user.createdAt)).length;
            setStats({
                totalUsers: response.total,
                activeUsers,
                bannedUsers,
                newUsersToday,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            message.error('Lỗi khi tải thống kê người dùng');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                search: searchText,
                status: statusFilter,
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
            };
            const response = await fetchAdminUsersAPI(params);
            const usersWithStatus = response.users.map((user) => ({
                ...user,
                isBanned: user.role === 'banned',
                key: user._id,
                role: user.role === 'admin' ? 'admin' : user.role === 'banned' ? 'banned' : 'user',
            }));
            setUsers(usersWithStatus);
            setPagination((prev) => ({ ...prev, total: response.total }));
            if (usersWithStatus.length === 0 && searchText) {
                message.info('Không tìm thấy người dùng phù hợp');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [searchText, statusFilter, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [fetchStats, fetchUsers]);

    const debouncedSearch = debounce((value) => {
        setSearchText(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, 300);

    const handleSearch = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, []);

    const handleTableChange = useCallback((newPagination) => {
        setPagination(newPagination);
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setStatusFilter(status);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    const handleResetFilter = useCallback(() => {
        setSearchText('');
        setStatusFilter('active');
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    const handleRefresh = useCallback(() => {
        fetchStats();
        fetchUsers();
    }, [fetchStats, fetchUsers]);

    const handleBanUser = useCallback(async (userId, isBanned) => {
        try {
            if (isBanned) {
                await unbanUserAPI(userId);
                message.success('Mở khóa người dùng thành công');
            } else {
                await banUserAPI(userId);
                message.success('Khóa người dùng thành công');
            }
            await fetchStats();
            await fetchUsers();
        } catch (error) {
            console.error('Error banning/unbanning user:', error);
            message.error('Lỗi khi khóa/mở khóa người dùng');
        }
    }, [fetchStats, fetchUsers]);

    const handleDeleteUser = useCallback(async (userId) => {
        try {
            await deleteUserAPI(userId);
            message.success('Xóa người dùng thành công');
            await fetchStats();
            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Lỗi khi xóa người dùng');
        }
    }, [fetchStats, fetchUsers]);

    const handleBanMultipleUsers = useCallback(async () => {
        try {
            await banMultipleUsersAPI(selectedRowKeys);
            message.success('Khóa nhiều người dùng thành công');
            await fetchStats();
            await fetchUsers();
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error banning multiple users:', error);
            message.error('Lỗi khi khóa nhiều người dùng');
        }
    }, [fetchStats, fetchUsers, selectedRowKeys]);

    const handleDeleteMultipleUsers = useCallback(async () => {
        try {
            await deleteMultipleUsersAPI(selectedRowKeys);
            message.success('Xóa nhiều người dùng thành công');
            await fetchStats();
            await fetchUsers();
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error deleting multiple users:', error);
            message.error('Lỗi khi xóa nhiều người dùng');
        }
    }, [fetchStats, fetchUsers, selectedRowKeys]);

    const handleViewDetails = useCallback((user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalVisible(false);
        setSelectedUser(null);
    }, []);

    const handleCopyText = useCallback((text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã sao chép!');
    }, []);

    const handleExportUsers = useCallback(async () => {
        try {
            const response = await exportUsersAPI(searchText, statusFilter);
            console.log('Export API response:', response);

            // Kiểm tra response là mảng hay object
            const users = Array.isArray(response) ? response : response.result || [];
            if (!users || users.length === 0) {
                message.info('Không có người dùng để xuất');
                return;
            }

            // Tạo CSV data
            const csvData = [
                ['Username', 'Email', 'Full Name', 'Phone', 'Created At', 'Post Count', 'Followers', 'Following', 'Status'],
                ...users.map((user) => [
                    `"${(user.username || '').replace(/"/g, '""')}"`,
                    `"${(user.email || '').replace(/"/g, '""')}"`,
                    `"${(user.fullName || '').replace(/"/g, '""')}"`,
                    `"${(user.phone || '').replace(/"/g, '""')}"`,
                    `"${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}"`,
                    user.postCount || 0,
                    user.followers ? user.followers.length : 0,
                    user.following ? user.following.length : 0,
                    user.role === 'banned' ? 'Đã khóa' : 'Hoạt động',
                ]),
            ]
                .map((row) => row.join(','))
                .join('\n');

            console.log('CSV Data:', csvData); // Debug nội dung CSV

            // Tạo file CSV
            const blob = new Blob([`\ufeff${csvData}`], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_${statusFilter}_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            message.success('Xuất danh sách người dùng thành công');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        } catch (error) {
            console.error('Error exporting users:', error);
            message.error('Lỗi khi xuất danh sách người dùng');
        }
    }, [searchText, statusFilter]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: 'select-active',
                text: 'Chọn người dùng hoạt động',
                onSelect: () => {
                    const activeUserKeys = users.filter((user) => !user.isBanned).map((user) => user.key);
                    setSelectedRowKeys(activeUserKeys);
                },
            },
            {
                key: 'select-banned',
                text: 'Chọn người dùng đã khóa',
                onSelect: () => {
                    const bannedUserKeys = users.filter((user) => user.isBanned).map((user) => user.key);
                    setSelectedRowKeys(bannedUserKeys);
                },
            },
        ],
    };

    const contextMenu = (record) => ({
        items: [
            {
                key: 'view',
                label: (
                    <span className="flex items-center gap-2 text-indigo-500">
                        <EyeOutlined /> Chi tiết
                    </span>
                ),
                onClick: () => handleViewDetails(record),
            },
            {
                key: 'ban',
                label: (
                    <span className="flex items-center gap-2 text-indigo-500">
                        {record.isBanned ? <UnlockOutlined /> : <LockOutlined />}
                        {record.isBanned ? 'Mở khóa' : 'Khóa'}
                    </span>
                ),
                onClick: () => handleBanUser(record._id, record.isBanned),
            },
            {
                key: 'delete',
                label: (
                    <span className="flex items-center gap-2 text-red-500">
                        <DeleteOutlined /> Xóa
                    </span>
                ),
                onClick: () => handleDeleteUser(record._id),
            },
        ],
    });

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Avatar',
            dataIndex: ['profile', 'avatar'],
            key: 'avatar',
            width: 80,
            render: (avatar, record) => (
                <Avatar
                    src={avatar}
                    icon={!avatar && (record.username ? record.username[0].toUpperCase() : <UserOutlined />)}
                    size={48}
                    className={`transition-transform hover:scale-110 hover:ring-1 hover:ring-indigo-200 border-3 ${record.role === 'admin' ? 'border-indigo-500' : record.isBanned ? 'border-red-500' : 'border-green-500'
                        } ${avatar ? '' : 'bg-indigo-500'}`}
                />
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
            render: (text) => (
                <span className="font-semibold text-sm md:text-base text-gray-800">
                    {text}
                </span>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            ellipsis: true,
            render: (text) => text || <span className="text-gray-500">Chưa có</span>,
            responsive: ['lg'],
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'indigo' : role === 'banned' ? 'red' : 'green'}>
                    {role === 'admin' ? 'Admin' : role === 'banned' ? 'Đã khóa' : 'User'}
                </Tag>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isBanned',
            key: 'isBanned',
            render: (isBanned) => (
                <Tag
                    color={isBanned ? 'red' : 'indigo'}
                    className={isBanned ? 'animate-pulse' : ''}
                >
                    {isBanned ? 'Đã khóa' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            responsive: ['md'],
        },
        {
            title: 'Bài viết',
            dataIndex: 'postCount',
            key: 'postCount',
            sorter: (a, b) => a.postCount - b.postCount,
            responsive: ['md'],
        },
        {
            title: 'Followers',
            dataIndex: 'followers',
            key: 'followers',
            render: (followers) => followers.length,
            sorter: (a, b) => a.followers.length - b.followers.length,
            responsive: ['lg'],
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 140,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                            size="small"
                            className="border-gray-300 hover:bg-gray-100 hover:scale-105 transition-transform"
                        />
                    </Tooltip>
                    <Tooltip title={record.isBanned ? 'Mở khóa' : 'Khóa'}>
                        <Popconfirm
                            title={`Bạn có chắc muốn ${record.isBanned ? 'mở khóa' : 'khóa'} người dùng này?`}
                            onConfirm={() => handleBanUser(record._id, record.isBanned)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                icon={record.isBanned ? <UnlockOutlined /> : <LockOutlined />}
                                type={record.isBanned ? 'default' : 'primary'}
                                size="small"
                                className={`${record.isBanned ? 'border-gray-300 hover:bg-gray-100' : 'bg-indigo-500 hover:bg-indigo-600 text-white'} hover:scale-105 transition-transform`}
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa người dùng này và toàn bộ dữ liệu liên quan?"
                            onConfirm={() => handleDeleteUser(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                                className="bg-red-500 hover:bg-red-600 text-white border-none hover:scale-105 transition-transform"
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Dropdown menu={contextMenu(record)} trigger={['click']}>
                        <Button
                            icon={<EllipsisOutlined />}
                            size="small"
                            className="border-gray-300 hover:bg-gray-100 hover:scale-105 transition-transform"
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-100">
            <Card className="p-6 rounded-3xl border border-gray-200 mt-4 bg-gradient-to-br from-indigo-50 to-white shadow-md hover:shadow-lg transition-shadow">
                <Flex justify="space-between" align="center" className="mb-6 flex-wrap gap-4">
                    <h1 className="text-lg md:text-2xl font-bold text-indigo-800">
                        Quản lý người dùng
                    </h1>
                    <Space size="middle">
                        <Tooltip title="Làm mới">
                            <Button
                                icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                                onClick={handleRefresh}
                                className="border-gray-300 hover:bg-gray-100"
                            />
                        </Tooltip>
                        <Tooltip title="Xuất dữ liệu">
                            <Button
                                icon={<ExportOutlined />}
                                onClick={handleExportUsers}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white border-none hover:animate-pulse"
                            >
                                Export CSV
                            </Button>
                        </Tooltip>
                    </Space>
                </Flex>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} className="p-4 rounded-3xl border border-indigo-100">
                                <Skeleton active avatar paragraph={{ rows: 2 }} />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 animate__animated animate__fadeIn">
                        <Tooltip title="Tổng số người dùng, bao gồm cả hoạt động và bị khóa">
                            <Card
                                className="p-4 rounded-3xl border border-indigo-100 bg-indigo-50 transition-all hover:scale-105 hover:shadow-lg shadow-md"
                            >
                                <Statistic
                                    title={<span className="text-gray-800 font-semibold">Tổng người dùng</span>}
                                    value={stats.totalUsers}
                                    prefix={<TeamOutlined className="text-indigo-600 animate-pulse" />}
                                    valueStyle={{ color: '#1f2937' }}
                                    suffix={stats.newUsersToday > 0 && <span className="text-xs text-indigo-600 ml-2">+{stats.newUsersToday} mới</span>}
                                />
                                <Progress
                                    percent={(stats.totalUsers / 1000) * 100}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#4f46e5"
                                    className="mt-2"
                                />
                            </Card>
                        </Tooltip>
                        <Tooltip title="Người dùng đang hoạt động, không bị khóa">
                            <Card
                                className="p-4 rounded-3xl border border-green-100 bg-green-50 transition-all hover:scale-105 hover:shadow-lg shadow-md"
                            >
                                <Statistic
                                    title={<span className="text-gray-800 font-semibold">Người dùng hoạt động</span>}
                                    value={stats.activeUsers}
                                    prefix={<UserOutlined className="text-green-600 animate-pulse" />}
                                    valueStyle={{ color: '#1f2937' }}
                                />
                                <Progress
                                    percent={(stats.activeUsers / stats.totalUsers) * 100 || 0}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#16a34a"
                                    className="mt-2"
                                />
                            </Card>
                        </Tooltip>
                        <Tooltip title="Người dùng bị khóa bởi admin">
                            <Card
                                className="p-4 rounded-3xl border border-red-100 bg-red-50 transition-all hover:scale-105 hover:shadow-lg shadow-md"
                            >
                                <Statistic
                                    title={<span className="text-gray-800 font-semibold">Người dùng bị khóa</span>}
                                    value={stats.bannedUsers}
                                    prefix={<LockOutlined className="text-red-600 animate-pulse" />}
                                    valueStyle={{ color: '#1f2937' }}
                                />
                                <Progress
                                    percent={(stats.bannedUsers / stats.totalUsers) * 100 || 0}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#dc2626"
                                    className="mt-2"
                                />
                            </Card>
                        </Tooltip>
                    </div>
                )}

                <Card className="p-4 rounded-3xl border border-gray-200 mb-4 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <Flex justify="space-between" align="center" wrap="wrap" className="gap-4">
                        <Input.Search
                            placeholder="Tìm kiếm theo username hoặc email"
                            onChange={handleSearch}
                            className="max-w-[300px] rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all"
                            allowClear
                        />
                        <Space>
                            <Tabs
                                activeKey={statusFilter}
                                onChange={handleStatusFilter}
                                className="transition-transform"
                                items={[
                                    { key: 'all', label: 'Tất cả' },
                                    { key: 'active', label: 'Hoạt động' },
                                    { key: 'banned', label: 'Đã khóa' },
                                ]}
                                tabBarStyle={{ background: '#e0e7ff', borderRadius: '8px', padding: '4px' }}
                            />
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilter}
                                className="border-gray-300 hover:bg-gray-100"
                            >
                                Reset All
                            </Button>
                        </Space>
                    </Flex>
                </Card>

                {selectedRowKeys.length > 0 && (
                    <Card className="p-4 rounded-3xl border border-gray-200 mb-4 animate__animated animate__fadeIn bg-gray-50 shadow-md hover:shadow-lg transition-shadow">
                        <Flex align="center" className="gap-4">
                            <span className="text-gray-800">
                                Đã chọn {selectedRowKeys.length} người dùng
                            </span>
                            <Space>
                                <Tooltip title="Khóa các người dùng đã chọn">
                                    <Popconfirm
                                        title="Bạn có chắc muốn khóa các người dùng đã chọn?"
                                        onConfirm={handleBanMultipleUsers}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button
                                            type="primary"
                                            icon={<LockOutlined />}
                                            className="bg-indigo-500 hover:bg-indigo-600"
                                        >
                                            Khóa
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
                                <Tooltip title="Xóa các người dùng đã chọn">
                                    <Popconfirm
                                        title="Bạn có chắc muốn xóa các người dùng đã chọn và toàn bộ dữ liệu liên quan?"
                                        onConfirm={handleDeleteMultipleUsers}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
                            </Space>
                        </Flex>
                    </Card>
                )}

                <Card className="p-4 rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 8 }} avatar />
                    ) : users.length === 0 ? (
                        <Empty
                            description="Không có người dùng nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white border-none"
                            >
                                Làm mới
                            </Button>
                        </Empty>
                    ) : (
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={users}
                            loading={loading}
                            pagination={pagination}
                            onChange={handleTableChange}
                            scroll={{ x: 1300 }}
                            size="middle"
                            rowClassName="transition-colors hover:bg-indigo-50"
                        />
                    )}
                </Card>

                <Modal
                    title={
                        <Flex align="center" className="gap-3">
                            <Avatar
                                src={selectedUser?.profile?.avatar}
                                icon={!selectedUser?.profile?.avatar && (selectedUser?.username ? selectedUser.username[0].toUpperCase() : <UserOutlined />)}
                                size={48}
                                className={`transition-transform hover:scale-110 hover:ring-1 hover:ring-indigo-200 border-3 ${selectedUser?.role === 'admin' ? 'border-indigo-500' : selectedUser?.isBanned ? 'border-red-500' : 'border-green-500'
                                    } ${selectedUser?.profile?.avatar ? '' : 'bg-indigo-500'}`}
                            />
                            <div>
                                <div className="text-lg font-bold text-indigo-800">
                                    {selectedUser?.username}
                                </div>
                                <div className="text-gray-500">{selectedUser?.email}</div>
                            </div>
                        </Flex>
                    }
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={[
                        <Button key="close" onClick={handleModalClose} className="border-gray-300 hover:bg-gray-100">
                            Đóng
                        </Button>,
                        <Button key="profile" type="primary" className="bg-indigo-500 hover:bg-indigo-600">
                            <a
                                href={`/profile/${selectedUser?.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Xem trang cá nhân
                            </a>
                        </Button>,
                    ]}
                    width={800}
                    className="animate__animated animate__fadeIn"
                >
                    {selectedUser && (
                        <div className="mt-6">
                            <Tabs defaultActiveKey="info" className="animate__animated animate__fadeIn">
                                <Tabs.TabPane tab="Thông tin cơ bản" key="info">
                                    <Flex vertical className="space-y-4">
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Họ tên:
                                            </div>
                                            <div className="text-gray-800">
                                                {selectedUser.fullName || 'Chưa có'}
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Số điện thoại:
                                            </div>
                                            <div className="text-gray-800">
                                                {selectedUser.phone || 'Chưa có'}
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Email:
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800">
                                                    {selectedUser.email}
                                                </span>
                                                <Button
                                                    icon={<CopyOutlined />}
                                                    size="small"
                                                    onClick={() => handleCopyText(selectedUser.email)}
                                                    className="border-gray-300 hover:bg-gray-100"
                                                />
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Website:
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedUser.profile?.website ? (
                                                    <a
                                                        href={selectedUser.profile.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-500"
                                                    >
                                                        {selectedUser.profile.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-800">Chưa có</span>
                                                )}
                                                {selectedUser.profile?.website && (
                                                    <Button
                                                        icon={<CopyOutlined />}
                                                        size="small"
                                                        onClick={() => handleCopyText(selectedUser.profile.website)}
                                                        className="border-gray-300 hover:bg-gray-100"
                                                    />
                                                )}
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Ngày đăng ký:
                                            </div>
                                            <div className="text-gray-800">
                                                {new Date(selectedUser.createdAt).toLocaleString()}
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Trạng thái:
                                            </div>
                                            <div>
                                                <Tag color={selectedUser.isBanned ? 'red' : 'indigo'}>
                                                    {selectedUser.isBanned ? 'Đã khóa' : 'Hoạt động'}
                                                </Tag>
                                            </div>
                                        </Flex>
                                        <Flex className="gap-4">
                                            <div className="w-[120px] text-gray-600">
                                                Vai trò:
                                            </div>
                                            <div>
                                                <Tag color={selectedUser.role === 'admin' ? 'indigo' : 'green'}>
                                                    {selectedUser.role === 'admin' ? 'Admin' : 'User'}
                                                </Tag>
                                            </div>
                                        </Flex>
                                    </Flex>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="Hoạt động" key="activity">
                                    <Flex vertical className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Card size="small" className="rounded-lg bg-white border border-gray-200">
                                                <Statistic
                                                    title="Bài viết"
                                                    value={selectedUser.postCount}
                                                    prefix={<TeamOutlined />}
                                                />
                                            </Card>
                                            <Card size="small" className="rounded-lg bg-white border border-gray-200">
                                                <Statistic
                                                    title="Followers"
                                                    value={selectedUser.followers.length}
                                                />
                                            </Card>
                                            <Card size="small" className="rounded-lg bg-white border border-gray-200">
                                                <Statistic
                                                    title="Following"
                                                    value={selectedUser.following.length}
                                                />
                                            </Card>
                                        </div>
                                        <Card size="small" className="rounded-lg bg-white border border-gray-200">
                                            <h3 className="text-sm font-medium mb-2 text-gray-600">
                                                Lịch sử hoạt động
                                            </h3>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                                        <span className="text-gray-800">
                                                            Đăng ký tài khoản vào {new Date(selectedUser.createdAt).toLocaleString()}
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        <span className="text-gray-800">
                                                            Đăng {selectedUser.postCount} bài viết
                                                        </span>
                                                    </li>
                                                    {selectedUser.isBanned && (
                                                        <li className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                            <span className="text-gray-800">
                                                                Tài khoản bị khóa bởi admin
                                                            </span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </Card>
                                    </Flex>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="Hành động" key="actions">
                                    <Space direction="vertical" className="w-full">
                                        <Popconfirm
                                            title={`Bạn có chắc muốn ${selectedUser.isBanned ? 'mở khóa' : 'khóa'} người dùng này?`}
                                            onConfirm={() => {
                                                handleBanUser(selectedUser._id, selectedUser.isBanned);
                                                handleModalClose();
                                            }}
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button
                                                type={selectedUser.isBanned ? 'default' : 'primary'}
                                                icon={selectedUser.isBanned ? <UnlockOutlined /> : <LockOutlined />}
                                                className={selectedUser.isBanned ? 'border-gray-300 hover:bg-gray-100' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}
                                                block
                                            >
                                                {selectedUser.isBanned ? 'Mở khóa người dùng' : 'Khóa người dùng'}
                                            </Button>
                                        </Popconfirm>
                                        <Popconfirm
                                            title="Bạn có chắc muốn xóa người dùng này và toàn bộ dữ liệu liên quan?"
                                            onConfirm={() => {
                                                handleDeleteUser(selectedUser._id);
                                                handleModalClose();
                                            }}
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                className="bg-red-500 hover:bg-red-600 text-white border-none"
                                                block
                                            >
                                                Xóa người dùng
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </Tabs.TabPane>
                            </Tabs>
                        </div>
                    )}
                </Modal>
            </Card>
        </div>
    );
};

export default UserManagement;