import { useEffect, useState, useCallback } from "react";
import {
    Table,
    Select,
    Button,
    Modal,
    Image,
    Popconfirm,
    Tag,
    message,
    Input,
    Avatar,
    Form,
    Space,
    Card,
    Typography,
    Tooltip,
    Badge,
    Divider,
    Tabs,
    Descriptions,
    Alert,
    Empty,
} from "antd";
import {
    EyeOutlined,
    DeleteOutlined,
    LockOutlined,
    WarningOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    LinkOutlined,
    ReloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import {
    fetchReportsAPI,
    markReportReviewedAPI,
    deletePostByAdminAPI,
    banUserAPI,
    fetchAdminPostsAPI,
    getPostReportCountAPI,
    warnUserAPI,
} from "../../services/admin.service";
import moment from "moment";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "animate.css";

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedReport, setSelectedReport] = useState(null);
    const [postDetails, setPostDetails] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [isWarnModalVisible, setIsWarnModalVisible] = useState(false);
    const [warnForm] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchReports = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await fetchReportsAPI({
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                filter: {
                    status: statusFilter !== "all" ? statusFilter : undefined,
                    reporter: { username: searchText || undefined },
                },
                ...params,
            });

            const reportsData = Array.isArray(response.reports) ? response.reports : response.reports || [];
            const reportsWithKey = reportsData.map((report) => ({
                ...report,
                key: report._id,
            }));

            setReports(reportsWithKey);
            setTotal(response.total || reportsData.length);
        } catch (error) {
            console.error("Error fetching reports:", error);
            message.error("Lỗi khi tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports, refreshKey]);

    const handleStatusFilter = useCallback((value) => {
        setStatusFilter(value);
        setPagination({ ...pagination, current: 1 });
    }, [pagination]);

    const handleSearch = useCallback((value) => {
        const trimmedValue = value?.trim();
        setSearchText(trimmedValue || "");
        setPagination({ ...pagination, current: 1 });
    }, [pagination]);

    const handleTableChange = useCallback((newPagination) => {
        setPagination(newPagination);
    }, []);

    const handleViewDetails = useCallback(async (report) => {
        setSelectedReport(report);
        setActionLoading(true);

        try {
            const [postResponse, countResponse] = await Promise.all([
                report.post?._id
                    ? fetchAdminPostsAPI({ "filter[_id]": report.post._id })
                    : Promise.resolve({ posts: [] }),
                report.post?._id
                    ? getPostReportCountAPI(report.post._id)
                    : Promise.resolve({ reportCount: 0 }),
            ]);

            const postData = Array.isArray(postResponse.posts)
                ? postResponse.posts[0]
                : postResponse.posts?.[0] || null;

            setPostDetails(postData);
            setReportCount(countResponse.reportCount || 0);
        } catch (error) {
            console.error("Error fetching post details:", error);
            message.error("Lỗi khi tải chi tiết bài viết");
        } finally {
            setActionLoading(false);
        }

        setIsModalVisible(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalVisible(false);
        setSelectedReport(null);
        setPostDetails(null);
        setReportCount(0);
    }, []);

    const handleReviewReport = useCallback(async (reportId) => {
        setActionLoading(true);

        try {
            await markReportReviewedAPI(reportId);
            message.success("Đã đánh dấu báo cáo là đã xử lý");

            setReports((prev) =>
                prev.map((report) => (report._id === reportId ? { ...report, status: "reviewed" } : report))
            );

            if (selectedReport?._id === reportId) {
                setSelectedReport((prev) => ({ ...prev, status: "reviewed" }));
            }

            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            console.error("Error reviewing report:", error);
            message.error("Lỗi khi đánh dấu báo cáo");
        } finally {
            setActionLoading(false);
        }
    }, [selectedReport]);

    const handleDeletePost = useCallback(async (postId) => {
        setActionLoading(true);

        try {
            await deletePostByAdminAPI(postId);
            message.success("Xóa bài viết thành công");
            setPostDetails(null);
            setRefreshKey((prev) => prev + 1);
            handleModalClose();
        } catch (error) {
            console.error("Error deleting post:", error);
            message.error("Lỗi khi xóa bài viết");
        } finally {
            setActionLoading(false);
        }
    }, [handleModalClose]);

    const handleBanUser = useCallback(async (userId) => {
        setActionLoading(true);

        try {
            await banUserAPI(userId);
            message.success("Khóa user thành công");
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            console.error("Error banning user:", error);
            message.error("Lỗi khi khóa user");
        } finally {
            setActionLoading(false);
        }
    }, []);

    const handleOpenWarnModal = useCallback(() => {
        setIsWarnModalVisible(true);
    }, []);

    const handleWarnUser = useCallback(async (values) => {
        setActionLoading(true);

        try {
            const { message: warningMessage } = values;
            await warnUserAPI(postDetails.author._id, warningMessage, selectedReport.post?._id);
            message.success("Gửi cảnh báo thành công");
            setIsWarnModalVisible(false);
            warnForm.resetFields();
        } catch (error) {
            console.error("Error warning user:", error);
            message.error("Lỗi khi gửi cảnh báo");
        } finally {
            setActionLoading(false);
        }
    }, [postDetails, selectedReport, warnForm]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearchText("");
        setStatusFilter("all");
        setPagination({ current: 1, pageSize: 10 });
    }, []);

    const columns = [
        {
            title: "Người báo cáo",
            dataIndex: ["reporter", "username"],
            key: "reporter",
            sorter: (a, b) => (a.reporter.username || "").localeCompare(b.reporter.username || ""),
            render: (text, record) => (
                <div className="flex items-center">
                    <Avatar
                        src={record.reporter.profile?.avatar}
                        icon={!record.reporter.profile?.avatar && <UserOutlined />}
                        size={32}
                        className="mr-2"
                    />
                    <Tooltip title={`ID: ${record.reporter._id || "N/A"}`}>
                        <Text>{text || <Text type="secondary">Không xác định</Text>}</Text>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: "Bài viết bị báo cáo",
            dataIndex: ["post", "caption"],
            key: "post",
            ellipsis: true,
            render: (text, record) => (
                <div className="flex items-center">
                    {record.post ? (
                        <>
                            {record.post.mediaFiles?.[0]?.type === "image" && (
                                <Image
                                    src={record.post.mediaFiles[0].url || "/placeholder.svg"}
                                    width={48}
                                    height={48}
                                    className="mr-3 object-cover rounded"
                                    preview={false}
                                    placeholder={
                                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                                            <FileTextOutlined className="text-gray-400" />
                                        </div>
                                    }
                                />
                            )}
                            <Tooltip title={text || "Không có caption"}>
                                <Text className="max-w-[300px] truncate">
                                    {text || <Text type="secondary">Không có caption</Text>}
                                </Text>
                            </Tooltip>
                        </>
                    ) : (
                        <Text type="secondary">Bài viết không tồn tại</Text>
                    )}
                </div>
            ),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            render: (reason) => <Tag color="blue">{reason || "Không xác định"}</Tag>,
            filters: [
                { text: "Spam", value: "Spam" },
                { text: "Nội dung không phù hợp", value: "Nội dung không phù hợp" },
                { text: "Quấy rối", value: "Quấy rối" },
                { text: "Khác", value: "Khác" },
            ],
            onFilter: (value, record) => record.reason === value,
        },
        {
            title: "Ngày báo cáo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt) => (
                <Tooltip title={createdAt ? moment(createdAt).format("DD/MM/YYYY HH:mm:ss") : "N/A"}>
                    <Space>
                        <ClockCircleOutlined className="text-gray-500" />
                        <span>{createdAt ? moment(createdAt).format("DD/MM/YYYY HH:mm") : <Text type="secondary">N/A</Text>}</span>
                    </Space>
                </Tooltip>
            ),
            sorter: (a, b) => (a.createdAt ? new Date(a.createdAt) : 0) - (b.createdAt ? new Date(b.createdAt) : 0),
            defaultSortOrder: "descend",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag
                    icon={status === "pending" ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                    color={status === "pending" ? "orange" : "green"}
                >
                    {status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
                </Tag>
            ),
            filters: [
                { text: "Chờ xử lý", value: "pending" },
                { text: "Đã xử lý", value: "reviewed" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        type="primary"
                        ghost
                        className="hover:bg-indigo-50"
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="link"
                        icon={<LinkOutlined />}
                        onClick={() => window.open(`/posts/${record.post?._id}`, "_blank")}
                        className="text-indigo-500 hover:text-indigo-600"
                        disabled={!record.post}
                    >
                        Xem bài viết
                    </Button>
                </Space>
            ),
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        arrows: true,
        autoplay: false,
        pauseOnHover: true,
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100">
            <Card className="p-6 rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                <Title level={2} className="text-indigo-800">
                    <Space>
                        <WarningOutlined />
                        Xử lý báo cáo
                    </Space>
                </Title>

                <div className="mb-6">
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Space wrap>
                            <Select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                className="w-[200px] rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all"
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
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="max-w-[300px] rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all"
                            />
                            <Tooltip title="Làm mới dữ liệu">
                                <Button
                                    icon={<ReloadOutlined className={loading ? "animate-spin" : ""} />}
                                    onClick={handleRefresh}
                                    className="border-gray-300 hover:bg-gray-100"
                                />
                            </Tooltip>
                            <Tooltip title="Xóa bộ lọc">
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={handleResetFilters}
                                    className="border-gray-300 hover:bg-gray-100"
                                />
                            </Tooltip>
                        </Space>
                    </Space>
                </div>

                {statusFilter === "pending" && (
                    <Alert
                        message="Báo cáo đang chờ xử lý"
                        description="Các báo cáo này cần được xem xét và xử lý kịp thời để đảm bảo nội dung trên nền tảng tuân thủ quy định."
                        type="warning"
                        showIcon
                        className="mb-4"
                        closable
                    />
                )}

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
                        showTotal: (total) => `Tổng cộng ${total} báo cáo`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    size="middle"
                    bordered
                    rowClassName={(record) => (record.status === "pending" ? "ant-table-row-pending" : "transition-colors hover:bg-indigo-50")}
                />

                <Modal
                    title={
                        <Space>
                            <WarningOutlined className="text-yellow-500" />
                            <Title level={4} className="text-indigo-800">Chi tiết báo cáo</Title>
                        </Space>
                    }
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                    width={800}
                    centered
                    className="animate__animated animate__fadeIn"
                    destroyOnClose
                >
                    {selectedReport && (
                        <div>
                            <Tabs defaultActiveKey="report" className="mb-4">
                                <TabPane
                                    tab={
                                        <Space>
                                            <WarningOutlined />
                                            Thông tin báo cáo
                                        </Space>
                                    }
                                    key="report"
                                >
                                    <Descriptions bordered column={1} size="small">
                                        <Descriptions.Item label="Người báo cáo">
                                            <Space>
                                                <Avatar
                                                    src={selectedReport.reporter.profile?.avatar}
                                                    icon={!selectedReport.reporter.profile?.avatar && <UserOutlined />}
                                                    size={32}
                                                />
                                                <Text strong>{selectedReport.reporter.username || "Không xác định"}</Text>
                                            </Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Lý do">
                                            <Tag color="blue">{selectedReport.reason || "Không xác định"}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mô tả">
                                            {selectedReport.description || <Text type="secondary">Không có mô tả</Text>}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày báo cáo">
                                            {selectedReport.createdAt
                                                ? moment(selectedReport.createdAt).format("DD/MM/YYYY HH:mm:ss")
                                                : <Text type="secondary">N/A</Text>}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái">
                                            <Tag
                                                icon={selectedReport.status === "pending" ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                                                color={selectedReport.status === "pending" ? "orange" : "green"}
                                            >
                                                {selectedReport.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
                                            </Tag>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <Space>
                                            <FileTextOutlined />
                                            Thông tin bài viết
                                        </Space>
                                    }
                                    key="post"
                                    disabled={!postDetails}
                                >
                                    {postDetails ? (
                                        postDetails.deleted === true ? (
                                            <Empty
                                                description={
                                                    <Text strong style={{ color: '#f5222d' }}>
                                                        Bài viết đã bị xóa
                                                    </Text>
                                                }
                                            />
                                        ) : (
                                            <>
                                                <Descriptions bordered column={1} size="small">
                                                    <Descriptions.Item label="Tác giả">
                                                        <Space>
                                                            <Avatar
                                                                src={postDetails.author.profile?.avatar}
                                                                icon={!postDetails.author.profile?.avatar && <UserOutlined />}
                                                                size={32}
                                                            />
                                                            <Text strong>{postDetails.author.username || "Không xác định"}</Text>
                                                        </Space>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Caption">
                                                        {postDetails.caption || <Text type="secondary">Không có caption</Text>}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Ngày đăng">
                                                        {postDetails.createdAt
                                                            ? moment(postDetails.createdAt).format("DD/MM/YYYY HH:mm:ss")
                                                            : <Text type="secondary">N/A</Text>}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Số lượt thích">
                                                        <Badge count={postDetails.likes?.length || 0} showZero style={{ backgroundColor: "#1890ff" }} />
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Số bình luận">
                                                        <Badge
                                                            count={postDetails.comments?.length || 0}
                                                            showZero
                                                            style={{ backgroundColor: "#52c41a" }}
                                                        />
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Số báo cáo">
                                                        <Badge count={reportCount} showZero style={{ backgroundColor: "#f5222d" }} />
                                                    </Descriptions.Item>
                                                </Descriptions>
                                                <Divider orientation="left">Media</Divider>
                                                {postDetails.mediaFiles?.length > 0 ? (
                                                    <div className="max-w-[500px] mx-auto">
                                                        <Slider {...sliderSettings}>
                                                            {postDetails.mediaFiles.map((media, index) => (
                                                                <div key={index}>
                                                                    {media.type === "image" ? (
                                                                        <Image
                                                                            src={media.url || "/placeholder.svg"}
                                                                            className="max-h-[400px] mx-auto object-contain"
                                                                        />
                                                                    ) : (
                                                                        <video
                                                                            controls
                                                                            className="max-h-[400px] max-w-full mx-auto block"
                                                                        >
                                                                            <source src={media.url} type="video/mp4" />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </Slider>
                                                    </div>
                                                ) : (
                                                    <Empty description="Không có media" />
                                                )}
                                                <div className="text-center mt-4">
                                                    <Button
                                                        type="primary"
                                                        icon={<LinkOutlined />}
                                                        onClick={() => window.open(`/posts/${selectedReport.post?._id}`, "_blank")}
                                                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                                                    >
                                                        Xem bài viết trong tab mới
                                                    </Button>
                                                </div>
                                            </>
                                        )
                                    ) : (
                                        <Empty
                                            description={
                                                <Text strong style={{ color: '#f5222d' }}>
                                                    Bài viết không tồn tại
                                                </Text>
                                            }
                                        />
                                    )}
                                </TabPane>
                            </Tabs>
                            <Divider orientation="left">Hành động</Divider>
                            <div className="flex justify-between flex-wrap gap-2">
                                <Space>
                                    {selectedReport.status === "pending" && (
                                        <Button
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleReviewReport(selectedReport._id)}
                                            loading={actionLoading}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white"
                                        >
                                            Đánh dấu đã xử lý
                                        </Button>
                                    )}
                                    {postDetails && postDetails.deleted !== true && (
                                        <Popconfirm
                                            title="Bạn có chắc muốn xóa bài viết này?"
                                            description="Hành động này sẽ xóa bài viết và không thể khôi phục."
                                            onConfirm={() => handleDeletePost(selectedReport.post?._id)}
                                            okText="Có"
                                            cancelText="Không"
                                            placement="topLeft"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={actionLoading}
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                Xóa bài viết
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                                {postDetails?.author?._id && (
                                    <Space>
                                        <Button
                                            icon={<WarningOutlined />}
                                            onClick={handleOpenWarnModal}
                                            loading={actionLoading}
                                            className="border-gray-300 hover:bg-gray-100"
                                        >
                                            Gửi cảnh báo
                                        </Button>
                                        <Popconfirm
                                            title="Bạn có chắc muốn khóa user này?"
                                            description="Hành động này sẽ khóa tài khoản người dùng."
                                            onConfirm={() => handleBanUser(postDetails.author._id)}
                                            okText="Có"
                                            cancelText="Không"
                                            placement="topLeft"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                icon={<LockOutlined />}
                                                danger
                                                loading={actionLoading}
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                Khóa user
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal
                    title={
                        <Space>
                            <WarningOutlined className="text-yellow-500" />
                            <span>Gửi cảnh báo</span>
                        </Space>
                    }
                    open={isWarnModalVisible}
                    onCancel={() => setIsWarnModalVisible(false)}
                    footer={null}
                    className="animate__animated animate__fadeIn"
                    destroyOnClose
                >
                    {postDetails?.author && (
                        <div className="mb-4">
                            <Alert
                                message="Thông tin người nhận cảnh báo"
                                description={
                                    <Space>
                                        <Avatar
                                            src={postDetails.author.profile?.avatar}
                                            icon={!postDetails.author.profile?.avatar && <UserOutlined />}
                                            size={32}
                                        />
                                        <Text strong>{postDetails.author.username || "Không xác định"}</Text>
                                    </Space>
                                }
                                type="info"
                                showIcon
                            />
                        </div>
                    )}
                    <Form form={warnForm} onFinish={handleWarnUser} layout="vertical">
                        <Form.Item
                            name="message"
                            label="Nội dung cảnh báo"
                            rules={[{ required: true, message: "Vui lòng nhập nội dung cảnh báo!" }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Nhập nội dung cảnh báo..."
                                showCount
                                maxLength={500}
                                className="rounded-lg"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<WarningOutlined />}
                                    loading={actionLoading}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                                >
                                    Gửi cảnh báo
                                </Button>
                                <Button
                                    onClick={() => setIsWarnModalVisible(false)}
                                    className="border-gray-300 hover:bg-gray-100"
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                <style jsx global>{`
                    .ant-table-row-pending {
                        background-color: #fff7e6;
                    }
                    .ant-table-row-pending:hover > td {
                        background-color: #fff1d6 !important;
                    }
                `}</style>
            </Card>
        </div>
    );
};

export default ReportManagement;