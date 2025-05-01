import React, { useEffect, useState } from 'react';
import { Table, Select, Button, Modal, Image, Popconfirm, Tag, message, Input } from 'antd';
import { EyeOutlined, DeleteOutlined, LockOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchReportsAPI, markReportReviewedAPI, deletePostByAdminAPI, banUserAPI, fetchAdminPostsAPI } from '../../services/admin.service';
import moment from 'moment';

const { Option } = Select;
const { Search } = Input;

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, reviewed
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedReport, setSelectedReport] = useState(null);
    const [postDetails, setPostDetails] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Gọi API để lấy danh sách báo cáo
    const fetchReports = async (params = {}) => {
        try {
            setLoading(true);
            const response = await fetchReportsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                'filter[status]': statusFilter !== 'all' ? statusFilter : undefined,
                'filter[reporter][username]': searchText || undefined,
                ...params,
            });
            const reportsData = Array.isArray(response)
                ? response
                : response.reports || [];
            setReports(reportsData);
            setTotal(response.total || reportsData.length);
        } catch (error) {
            console.error('Error fetching reports:', error);
            message.error('Lỗi khi tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

    // Xử lý thay đổi trạng thái lọc
    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    // Xem chi tiết báo cáo và lấy thông tin bài viết
    const handleViewDetails = async (report) => {
        setSelectedReport(report);
        try {
            const response = await fetchAdminPostsAPI({ 'filter[_id]': report.post._id });
            const postData = Array.isArray(response)
                ? response[0]
                : response.posts?.[0] || null;
            setPostDetails(postData);
        } catch (error) {
            console.error('Error fetching post details:', error);
            message.error('Lỗi khi tải chi tiết bài viết');
        }
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedReport(null);
        setPostDetails(null);
    };

    // Đánh dấu báo cáo là reviewed
    const handleReviewReport = async (reportId) => {
        try {
            await markReportReviewedAPI(reportId);
            message.success('Đã đánh dấu báo cáo là đã xử lý');
            setReports((prev) =>
                prev.map((report) =>
                    report._id === reportId ? { ...report, status: 'reviewed' } : report
                )
            );
            if (selectedReport?._id === reportId) {
                setSelectedReport((prev) => ({ ...prev, status: 'reviewed' }));
            }
        } catch (error) {
            console.error('Error reviewing report:', error);
            message.error('Lỗi khi đánh dấu báo cáo');
        }
    };

    // Xóa bài viết
    const handleDeletePost = async (postId) => {
        try {
            await deletePostByAdminAPI(postId);
            message.success('Xóa bài viết thành công');
            setPostDetails(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            message.error('Lỗi khi xóa bài viết');
        }
    };

    // Khóa user
    const handleBanUser = async (userId) => {
        try {
            await banUserAPI(userId);
            message.success('Khóa user thành công');
        } catch (error) {
            console.error('Error banning user:', error);
            message.error('Lỗi khi khóa user');
        }
    };

    // Cảnh báo user (giả định API)
    const handleWarnUser = async (userId, warningMessage) => {
        try {
            // Giả định API warnUserAPI
            await axios.post(`/v1/api/admin/users/${userId}/warn`, { message: warningMessage });
            message.success('Gửi cảnh báo thành công');
        } catch (error) {
            console.error('Error warning user:', error);
            message.error('Lỗi khi gửi cảnh báo');
        }
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'Người báo cáo',
            dataIndex: ['reporter', 'username'],
            key: 'reporter',
            sorter: (a, b) => a.reporter.username.localeCompare(b.reporter.username),
        },
        {
            title: 'Bài viết',
            dataIndex: ['post', 'caption'],
            key: 'post',
            ellipsis: true,
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'pending' ? 'orange' : 'green'}>
                    {status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                </Tag>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Xử lý báo cáo</h1>
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    style={{ width: 200 }}
                    placeholder="Lọc theo trạng thái"
                >
                    <Option value="all">Tất cả</Option>
                    <Option value="pending">Chờ xử lý</Option>
                    <Option value="reviewed">Đã xử lý</Option>
                </Select>
                <Search
                    placeholder="Tìm kiếm theo username người báo cáo"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ maxWidth: 400 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={reports}
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
                title="Chi tiết báo cáo"
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedReport && (
                    <div>
                        <p><strong>Người báo cáo:</strong> {selectedReport.reporter.username}</p>
                        <p><strong>Bài viết:</strong> {selectedReport.post.caption}</p>
                        <p><strong>Lý do:</strong> {selectedReport.reason}</p>
                        <p><strong>Mô tả:</strong> {selectedReport.description}</p>
                        <p><strong>Thời gian:</strong> {moment(selectedReport.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        <p><strong>Trạng thái:</strong> {selectedReport.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}</p>
                        {postDetails && (
                            <>
                                <p><strong>Chi tiết bài viết:</strong></p>
                                <p><strong>Tác giả:</strong> {postDetails.author.username}</p>
                                <div style={{ marginBottom: 16 }}>
                                    {postDetails.mediaFiles?.map((media, index) => (
                                        <div key={index} style={{ display: 'inline-block', marginRight: 16 }}>
                                            {media.type === 'image' ? (
                                                <Image src={media.url} width={150} />
                                            ) : (
                                                <video width="150" controls>
                                                    <source src={media.url} type="video/mp4" />
                                                </video>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div style={{ marginTop: 16 }}>
                            {selectedReport.status === 'pending' && (
                                <Button
                                    type="primary"
                                    onClick={() => handleReviewReport(selectedReport._id)}
                                    style={{ marginRight: 8 }}
                                >
                                    Đánh dấu đã xử lý
                                </Button>
                            )}
                            {postDetails && (
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa bài viết này?"
                                    onConfirm={() => handleDeletePost(selectedReport.post._id)}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button danger icon={<DeleteOutlined />} style={{ marginRight: 8 }}>
                                        Xóa bài viết
                                    </Button>
                                </Popconfirm>
                            )}
                            {postDetails?.author?._id && (
                                <>
                                    <Popconfirm
                                        title="Bạn có chắc muốn gửi cảnh báo cho user này?"
                                        onConfirm={() => handleWarnUser(postDetails.author._id, 'Nội dung không phù hợp')}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button icon={<WarningOutlined />} style={{ marginRight: 8 }}>
                                            Gửi cảnh báo
                                        </Button>
                                    </Popconfirm>
                                    <Popconfirm
                                        title="Bạn có chắc muốn khóa user này?"
                                        onConfirm={() => handleBanUser(postDetails.author._id)}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button icon={<LockOutlined />}>
                                            Khóa user
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReportManagement;