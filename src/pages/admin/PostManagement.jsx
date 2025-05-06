import { useEffect, useState, useCallback } from "react";
import {
    Table,
    Input,
    Button,
    Modal,
    Image,
    Popconfirm,
    Tag,
    message,
    DatePicker,
    Space,
    Typography,
    Card,
    Tooltip,
    Badge,
    Divider,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    DeleteOutlined,
    LinkOutlined,
    UndoOutlined,
    FilterOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { fetchAdminPostsAPI, deletePostByAdminAPI, restorePostByAdminAPI } from "../../services/admin.service";
import moment from "moment";
import "animate.css";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchPosts = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const apiParams = {
                limit: pagination.pageSize,
                skip: (pagination.current - 1) * pagination.pageSize,
                filter: {
                    username: searchText ? searchText : undefined,
                    dateRange: {
                        startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
                        endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
                    },
                    deleted:
                        statusFilter === "all" || statusFilter === "reported"
                            ? undefined
                            : statusFilter === "active"
                                ? "false"
                                : "true",
                    reported: statusFilter === "reported" ? "true" : undefined,
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
                key: post._id,
            }));

            setPosts(postsWithStatus);
            setTotal(response.total || postsData.length);
        } catch (error) {
            console.error("Error fetching posts:", error.response?.data || error.message);
            message.error("Lỗi khi tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, searchText, dateRange, statusFilter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, refreshKey]);

    const handleSearch = useCallback((value) => {
        const trimmedValue = value?.trim();
        setSearchText(trimmedValue || "");
        setPagination({ ...pagination, current: 1 });
    }, [pagination]);

    const handleDateChange = useCallback((dates) => {
        setDateRange(dates || []);
        setPagination({ ...pagination, current: 1 });
    }, [pagination]);

    const handleTableChange = useCallback((newPagination) => {
        setPagination(newPagination);
    }, []);

    const handleDeletePost = useCallback(async (postId) => {
        try {
            setLoading(true);
            const post = posts.find((p) => p._id === postId);
            if (!post) throw new Error("Không tìm thấy bài viết");

            if (post.deleted) {
                await restorePostByAdminAPI(postId);
                message.success("Khôi phục bài viết thành công và xử lý các báo cáo liên quan");
            } else {
                await deletePostByAdminAPI(postId);
                message.success("Đã xóa bài viết và xử lý các báo cáo liên quan");
            }

            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            console.error("Error handling post:", error.response?.data || error.message);
            message.error(error.response?.data?.message || "Lỗi khi xử lý bài viết");
        } finally {
            setLoading(false);
        }
    }, [posts]);

    const handleViewDetails = useCallback((post) => {
        setSelectedPost(post);
        setIsModalVisible(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalVisible(false);
        setSelectedPost(null);
    }, []);

    const handleOpenPost = useCallback(() => {
        if (selectedPost) {
            const postUrl = `/posts/${selectedPost._id}`;
            window.open(postUrl, "_blank");
        }
    }, [selectedPost]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearchText("");
        setDateRange([]);
        setStatusFilter("all");
        setPagination({ current: 1, pageSize: 10 });
    }, []);

    const columns = [
        {
            title: "Thumbnail",
            dataIndex: "mediaFiles",
            key: "thumbnail",
            width: 80,
            render: (mediaFiles) => {
                const media = mediaFiles?.[0];
                if (!media) return <Text type="secondary">Không có media</Text>;

                if (media.type === "image") {
                    return (
                        <Image
                            src={media.url || "/placeholder.svg"}
                            width={60}
                            height={60}
                            style={{ objectFit: "cover", borderRadius: "4px" }}
                            placeholder={
                                <div
                                    style={{
                                        width: 60,
                                        height: 60,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        background: "#f0f0f0",
                                    }}
                                >
                                    Loading...
                                </div>
                            }
                            preview={{
                                mask: <EyeOutlined />,
                            }}
                        />
                    );
                }

                if (media.type === "video") {
                    return (
                        <div style={{ position: "relative", width: 60, height: 60 }}>
                            <video width="60" height="60" style={{ objectFit: "cover", borderRadius: "4px" }}>
                                <source src={media.url} type="video/mp4" />
                            </video>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    background: "rgba(0,0,0,0.3)",
                                    borderRadius: "4px",
                                }}
                            >
                                <Button
                                    type="text"
                                    icon={<EyeOutlined style={{ color: "white" }} />}
                                    onClick={() => handleViewDetails({ mediaFiles: [media] })}
                                />
                            </div>
                        </div>
                    );
                }

                return <Text type="secondary">Không có media</Text>;
            },
        },
        {
            title: "Tiêu đề",
            dataIndex: "caption",
            key: "caption",
            ellipsis: true,
            render: (caption) => (
                <Tooltip title={caption || "Không có tiêu đề"}>
                    <span>{caption || <Text type="secondary">Không có tiêu đề</Text>}</span>
                </Tooltip>
            ),
        },
        {
            title: "Tác giả",
            dataIndex: ["author", "username"],
            key: "author",
            sorter: (a, b) => (a.author?.username || "").localeCompare(b.author?.username || ""),
            render: (username, record) => (
                <Tooltip title={`ID: ${record.author?._id || "N/A"}`}>
                    {username || <Text type="secondary">Không xác định</Text>}
                </Tooltip>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt) => (
                <Tooltip title={createdAt ? moment(createdAt).format("DD/MM/YYYY HH:mm:ss") : "N/A"}>
                    {createdAt ? moment(createdAt).format("DD/MM/YYYY HH:mm") : <Text type="secondary">N/A</Text>}
                </Tooltip>
            ),
            sorter: (a, b) => (a.createdAt ? new Date(a.createdAt) : 0) - (b.createdAt ? new Date(b.createdAt) : 0),
            defaultSortOrder: "descend",
        },
        {
            title: "Tương tác",
            key: "interactions",
            render: (_, record) => (
                <Space>
                    <Badge count={record.likes?.length || 0} showZero overflowCount={999} style={{ backgroundColor: "#1890ff" }}>
                        <Button size="small" type="text">
                            Thích
                        </Button>
                    </Badge>
                    <Badge
                        count={record.comments?.length || 0}
                        showZero
                        overflowCount={999}
                        style={{ backgroundColor: "#52c41a" }}
                    >
                        <Button size="small" type="text">
                            Bình luận
                        </Button>
                    </Badge>
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "deleted",
            key: "deleted",
            render: (deleted, record) => {
                if (record.reported) {
                    return (
                        <Tag icon={<ExclamationCircleOutlined />} color="orange">
                            Đang bị báo cáo
                        </Tag>
                    );
                }
                return (
                    <Tag color={deleted ? "red" : "green"} icon={deleted ? <DeleteOutlined /> : null}>
                        {deleted ? "Đã ẩn" : "Hiển thị"}
                    </Tag>
                );
            },
            filters: [
                { text: "Hiển thị", value: false },
                { text: "Đã ẩn", value: true },
                { text: "Đang bị báo cáo", value: "reported" },
            ],
            onFilter: (value, record) => {
                if (value === "reported") return record.reported;
                return record.deleted === value;
            },
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
                    <Popconfirm
                        title={`Bạn có chắc muốn ${record.deleted ? "hiển thị lại" : "ẩn"} bài viết này?`}
                        onConfirm={() => handleDeletePost(record._id)}
                        okText="Có"
                        cancelText="Không"
                        placement="topRight"
                    >
                        <Button
                            icon={record.deleted ? <UndoOutlined /> : <DeleteOutlined />}
                            danger={!record.deleted}
                            type={record.deleted ? "default" : "primary"}
                            className={record.deleted ? "border-gray-300 hover:bg-gray-100" : "bg-red-500 hover:bg-red-600 text-white"}
                        >
                            {record.deleted ? "Hiển thị" : "Ẩn/Xóa"}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-100">
            <Card className="p-6 rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                <Title level={2} className="text-indigo-800">
                    Quản lý bài viết
                </Title>

                <div className="mb-6">
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Space wrap>
                            <Search
                                placeholder="Tìm kiếm theo username tác giả"
                                allowClear
                                enterButton={<SearchOutlined />}
                                onSearch={handleSearch}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="max-w-[300px] rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all"
                            />
                            <RangePicker
                                onChange={handleDateChange}
                                format="DD/MM/YYYY"
                                placeholder={["Từ ngày", "Đến ngày"]}
                                value={dateRange}
                                className="rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all"
                                style={{ width: 280 }}
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

                        <Space wrap>
                            <Button
                                type={statusFilter === "all" ? "primary" : "default"}
                                onClick={() => setStatusFilter("all")}
                                className={statusFilter === "all" ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "border-gray-300 hover:bg-gray-100"}
                            >
                                Tất cả
                            </Button>
                            <Button
                                type={statusFilter === "active" ? "primary" : "default"}
                                onClick={() => setStatusFilter("active")}
                                className={statusFilter === "active" ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "border-gray-300 hover:bg-gray-100"}
                            >
                                Đang hiển thị
                            </Button>
                            <Button
                                type={statusFilter === "deleted" ? "primary" : "default"}
                                onClick={() => setStatusFilter("deleted")}
                                className={statusFilter === "deleted" ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "border-gray-300 hover:bg-gray-100"}
                            >
                                Đã bị xóa
                            </Button>
                            <Button
                                type={statusFilter === "reported" ? "primary" : "default"}
                                onClick={() => setStatusFilter("reported")}
                                danger={statusFilter === "reported"}
                                icon={statusFilter === "reported" ? <ExclamationCircleOutlined /> : null}
                                className={statusFilter === "reported" ? "bg-red-500 hover:bg-red-600 text-white" : "border-gray-300 hover:bg-gray-100"}
                            >
                                Đang bị báo cáo
                            </Button>
                        </Space>
                    </Space>
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
                        showTotal: (total) => `Tổng cộng ${total} bài viết`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    size="middle"
                    bordered
                    rowClassName="transition-colors hover:bg-indigo-50"
                />

                <Modal
                    title={<Title level={4} className="text-indigo-800">Chi tiết bài viết</Title>}
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={[
                        <Button key="close" onClick={handleModalClose} className="border-gray-300 hover:bg-gray-100">
                            Đóng
                        </Button>,
                        <Button
                            key="open"
                            type="primary"
                            icon={<LinkOutlined />}
                            onClick={handleOpenPost}
                            disabled={!selectedPost}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                            Xem bài viết
                        </Button>,
                    ]}
                    width={800}
                    centered
                    className="animate__animated animate__fadeIn"
                >
                    {selectedPost && (
                        <div>
                            <div className="mb-6">
                                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                    <div className="flex justify-between">
                                        <Text strong>Tiêu đề:</Text>
                                        <Text>{selectedPost.caption || "Không có tiêu đề"}</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Text strong>Tác giả:</Text>
                                        <Text>{selectedPost.author?.username || "Không xác định"}</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Text strong>Ngày tạo:</Text>
                                        <Text>
                                            {selectedPost.createdAt
                                                ? moment(selectedPost.createdAt).format("DD/MM/YYYY HH:mm")
                                                : "N/A"}
                                        </Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Text strong>Số lượt thích:</Text>
                                        <Text>{selectedPost.likes?.length || 0}</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Text strong>Số bình luận:</Text>
                                        <Text>{selectedPost.comments?.length || 0}</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Text strong>Trạng thái:</Text>
                                        <Tag color={selectedPost.deleted ? "red" : selectedPost.reported ? "orange" : "green"}>
                                            {selectedPost.reported ? "Đang bị báo cáo" : selectedPost.deleted ? "Đã ẩn" : "Hiển thị"}
                                        </Tag>
                                    </div>
                                </Space>
                            </div>

                            <Title level={5} className="text-gray-800">Media:</Title>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {selectedPost.mediaFiles?.length > 0 ? (
                                    selectedPost.mediaFiles.map((media, index) => (
                                        <div key={index} className="mb-4">
                                            {media.type === "image" ? (
                                                <Image
                                                    src={media.url || "/placeholder.svg"}
                                                    width={200}
                                                    style={{ objectFit: "cover", borderRadius: "8px" }}
                                                    preview={{
                                                        mask: <EyeOutlined />,
                                                    }}
                                                />
                                            ) : (
                                                <video width={200} controls style={{ borderRadius: "8px" }}>
                                                    <source src={media.url} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <Text type="secondary">Không có media</Text>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </Card>
        </div>
    );
};

export default PostManagement;