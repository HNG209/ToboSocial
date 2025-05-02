import React, { useEffect, useState } from 'react';
import { Table, Select, Button, Modal, Image, Popconfirm, Tag, message, Input, Avatar, Form, Input as AntdInput } from 'antd';
import { EyeOutlined, DeleteOutlined, LockOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchReportsAPI, markReportReviewedAPI, deletePostByAdminAPI, banUserAPI, fetchAdminPostsAPI, getPostReportCountAPI, warnUserAPI } from '../../services/admin.service';
import moment from 'moment';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const { Option } = Select;
const { Search } = Input;

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedReport, setSelectedReport] = useState(null);
    const [postDetails, setPostDetails] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [isWarnModalVisible, setIsWarnModalVisible] = useState(false);
    const [warnForm] = Form.useForm();

    const fetchReports = async (params = {}) => {
        try {
            setLoading(true);
            const response = await fetchReportsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                filter: {
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    reporter: { username: searchText || undefined },
                },
            });
            const reportsData = Array.isArray(response.reports) ? response.reports : response.reports || [];
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

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleViewDetails = async (report) => {
        setSelectedReport(report);
        try {
            const [postResponse, countResponse] = await Promise.all([
                fetchAdminPostsAPI({ 'filter[_id]': report.post._id }),
                getPostReportCountAPI(report.post._id)
            ]);
            const postData = Array.isArray(postResponse.posts) ? postResponse.posts[0] : postResponse.posts?.[0] || null;
            setPostDetails(postData);
            setReportCount(countResponse.reportCount || 0);
        } catch (error) {
            console.error('Error fetching post details:', error);
            message.error('Lỗi khi tải chi tiết bài viết');
        }
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedReport(null);
        setPostDetails(null);
        setReportCount(0);
    };

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

    const handleBanUser = async (userId) => {
        try {
            await banUserAPI(userId);
            message.success('Khóa user thành công');
        } catch (error) {
            console.error('Error banning user:', error);
            message.error('Lỗi khi khóa user');
        }
    };

    const handleOpenWarnModal = () => {
        setIsWarnModalVisible(true);
    };

    const handleWarnUser = async (values) => {
        try {
            const { message: warningMessage } = values;
            await warnUserAPI(postDetails.author._id, warningMessage, selectedReport.post._id);
            message.success('Gửi cảnh báo thành công');
            setIsWarnModalVisible(false);
            warnForm.resetFields();
        } catch (error) {
            console.error('Error warning user:', error);
            message.error('Lỗi khi gửi cảnh báo');
        }
    };

    const columns = [
        {
            title: 'Người báo cáo',
            dataIndex: ['reporter', 'username'],
            key: 'reporter',
            sorter: (a, b) => a.reporter.username.localeCompare(b.reporter.username),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={record.reporter.profile?.avatar} size={24} style={{ marginRight: 8 }} />
                    {text}
                </div>
            ),
        },
        {
            title: 'Bài viết bị báo cáo',
            dataIndex: ['post', 'caption'],
            key: 'post',
            ellipsis: true,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {record.post.mediaFiles?.[0]?.type === 'image' && (
                        <Image src={record.post.mediaFiles[0].url} width={40} height={40} style={{ marginRight: 8, objectFit: 'cover' }} preview={false} />
                    )}
                    {text || 'Không có caption'}
                </div>
            ),
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Ngày báo cáo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="link"
                        onClick={() => window.open(`/posts/${record.post._id}`, '_blank')}
                    >
                        Xem bài viết
                    </Button>
                </div>
            ),
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

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
                        <p>
                            <strong>Người báo cáo:</strong>{' '}
                            <Avatar src={selectedReport.reporter.profile?.avatar} size={24} style={{ marginRight: 8 }} />
                            {selectedReport.reporter.username}
                        </p>
                        <p><strong>Lý do:</strong> {selectedReport.reason}</p>
                        <p><strong>Mô tả:</strong> {selectedReport.description || 'Không có mô tả'}</p>
                        <p><strong>Ngày báo cáo:</strong> {moment(selectedReport.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        <p><strong>Trạng thái:</strong>{' '}
                            <Tag color={selectedReport.status === 'pending' ? 'orange' : 'green'}>
                                {selectedReport.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                            </Tag>
                        </p>
                        {postDetails && (
                            <>
                                <p><strong>Bài viết bị báo cáo:</strong></p>
                                <p><strong>Tác giả:</strong> {postDetails.author.username}</p>
                                <p><strong>Caption:</strong> {postDetails.caption || 'Không có caption'}</p>
                                <p><strong>Tổng số báo cáo:</strong> {reportCount}</p>
                                <Button
                                    type="link"
                                    onClick={() => window.open(`/posts/${selectedReport.post._id}`, '_blank')}
                                    style={{ padding: 0, marginBottom: 16 }}
                                >
                                    Xem bài viết trong tab mới
                                </Button>
                                {postDetails.mediaFiles?.length > 0 && (
                                    <Slider {...sliderSettings}>
                                        {postDetails.mediaFiles.map((media, index) => (
                                            <div key={index}>
                                                {media.type === 'image' ? (
                                                    <Image src={media.url} width={300} style={{ margin: '0 auto' }} />
                                                ) : (
                                                    <video width="300" controls style={{ margin: '0 auto', display: 'block' }}>
                                                        <source src={media.url} type="video/mp4" />
                                                    </video>
                                                )}
                                            </div>
                                        ))}
                                    </Slider>
                                )}
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
                                    <Button
                                        icon={<WarningOutlined />}
                                        onClick={handleOpenWarnModal}
                                        style={{ marginRight: 8 }}
                                    >
                                        Gửi cảnh báo
                                    </Button>
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
            <Modal
                title="Gửi cảnh báo"
                open={isWarnModalVisible}
                onCancel={() => setIsWarnModalVisible(false)}
                footer={null}
            >
                <Form
                    form={warnForm}
                    onFinish={handleWarnUser}
                    layout="vertical"
                >
                    <Form.Item
                        name="message"
                        label="Nội dung cảnh báo"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung cảnh báo!' }]}
                    >
                        <AntdInput.TextArea rows={4} placeholder="Nhập nội dung cảnh báo..." />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Gửi
                        </Button>
                        <Button onClick={() => setIsWarnModalVisible(false)} style={{ marginLeft: 8 }}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReportManagement;