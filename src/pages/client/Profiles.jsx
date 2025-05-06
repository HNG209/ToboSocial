import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserByUsernameAPI, getUserPostsAPI, followUserAPI, unfollowUserAPI } from "../../services/user.service";
import { Tabs, Avatar, Button, notification } from "antd";
import { UserOutlined } from "@ant-design/icons";

const Profilex = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Người dùng trong hồ sơ
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [page, setPage] = useState(1);
    const [loadingFollow, setLoadingFollow] = useState(false); // Trạng thái tải cho follow/unfollow
    const limit = 9;

    // Lấy thông tin người dùng hiện tại từ Redux
    const currentUser = useSelector((state) => state.auth.user);

    // Lấy thông tin người dùng trong hồ sơ
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getUserByUsernameAPI(username);
                setUser(res); // Giả sử API trả về { data: {...} }
            } catch (err) {
                console.error("Lỗi lấy người dùng theo username:", err);
            }
        };

        fetchProfile();
    }, [username]);

    // Lấy bài viết của người dùng
    useEffect(() => {
        if (!user?._id) return;

        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                const res = await getUserPostsAPI(user._id, page, limit);
                setPosts(res || []);
            } catch (err) {
                console.error("Lỗi lấy bài viết:", err);
                setPosts([]);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [user, page]);

    // Kiểm tra trạng thái theo dõi
    const isFollowing = currentUser?.following?.includes(user?._id);

    // Hiển thị thông báo khi chưa đăng nhập
    const showLoginNotification = () => {
        notification.warning({
            message: 'Authentication Required',
            description: 'Please log in to follow users, or continue viewing without interaction.',
            placement: 'topRight',
            duration: 0, // Keep notification open until user interacts
            btn: (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        onClick={() => {
                            notification.destroy();
                            navigate('/login');
                        }}
                    >
                        Log In
                    </Button>
                    <Button
                        onClick={() => notification.destroy()}
                    >
                        Continue Viewing
                    </Button>
                </div>
            ),
        });
    };

    // Xử lý follow/unfollow
    const handleFollow = async () => {
        if (!currentUser || !user) {
            showLoginNotification();
            return;
        }

        setLoadingFollow(true);

        try {
            const payload = { targetUserId: user._id, currentUserId: currentUser._id };
            let response;

            if (isFollowing) {
                response = await unfollowUserAPI(user._id, currentUser._id);
            } else {
                response = await followUserAPI(user._id, currentUser._id);
            }

            // Làm mới thông tin hồ sơ để cập nhật số lượng followers/following
            const updatedProfile = await getUserByUsernameAPI(username);
            setUser(updatedProfile);
        } catch (err) {
            console.error("Lỗi khi follow/unfollow:", err);
            notification.error({
                message: 'Error',
                description: err.message || 'Không thể thực hiện hành động này.',
                placement: 'topRight',
            });
        } finally {
            setLoadingFollow(false);
        }
    };

    if (!user) return <div className="text-center py-8">Loading...</div>;

    const tabItems = [
        {
            key: "posts",
            label: <span>Posts</span>,
            children: (
                <div>
                    {loadingPosts ? (
                        <div className="text-center py-8">Loading posts...</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <Link to={`/posts/${post._id}`} key={post._id}>
                                        <img
                                            src={post.mediaFiles?.[0]?.url}
                                            alt="Post"
                                            className="w-full h-80 object-cover rounded-md"
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-8 text-gray-500">
                                    No posts yet.
                                </div>
                            )}
                        </div>
                    )}
                    {posts.length > 0 && posts.length % limit === 0 && (
                        <div className="text-center mt-4">
                            <Button onClick={() => setPage(page + 1)} loading={loadingPosts}>
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header Profile */}
            <div className="flex gap-8 mb-8">
                <div className="w-1/3">
                    <Avatar
                        size={120}
                        src={user.profile?.avatar || `https://i.pravatar.cc/150?u=${user._id}`}
                        icon={<UserOutlined />}
                        className="border border-gray-200"
                    />
                </div>
                <div className="w-2/3">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-xl font-semibold">{user.username}</h1>
                        {currentUser?._id !== user._id && (
                            <Button
                                type="primary"
                                className={`rounded ${isFollowing ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"} border-none`}
                                onClick={handleFollow}
                                loading={loadingFollow}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-6 mb-4">
                        <div>
                            <span className="font-semibold">{user.postCount || posts.length || 0}</span> posts
                        </div>
                        <div>
                            <span className="font-semibold">{user.followers?.length || 0}</span> followers
                        </div>
                        <div>
                            <span className="font-semibold">{user.following?.length || 0}</span> following
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">{user.fullName}</div>
                        <p className="text-gray-600">{user.bio || "No bio available."}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                items={tabItems}
                centered
                tabBarStyle={{ borderBottom: "1px solid #e5e5e5", marginBottom: "16px" }}
            />
        </div>
    );
};

export default Profilex;