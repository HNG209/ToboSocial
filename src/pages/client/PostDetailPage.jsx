import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Avatar, Button, Input, Menu, Dropdown, notification, Modal } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, SendOutlined, UserOutlined, LeftOutlined, RightOutlined, SoundOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { IoIosMore } from 'react-icons/io';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
    fetchPostDetailAPI,
    fetchCommentsByPostAPI,
    likePostAPI,
    unlikePostAPI,
    createCommentAPI,
    deleteCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
} from '../../services/api.service';

// Hàm tính thời gian
const timeAgo = (date, referenceTime) => {
    const now = referenceTime || new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
};

// Hàm sao chép liên kết vào clipboard
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        notification.success({
            message: 'Link Copied',
            description: 'The post link has been copied to your clipboard.',
            placement: 'topRight',
        });
    }).catch((error) => {
        console.error('Failed to copy:', error);
        notification.error({
            message: 'Copy Failed',
            description: 'Failed to copy the link. Please try again.',
            placement: 'topRight',
        });
    });
};

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const userId = useSelector((state) => state.auth.user?._id);
    const [postDetail, setPostDetail] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [postTime, setPostTime] = useState('');
    const [commentTimes, setCommentTimes] = useState([]);
    const [isDeleting, setIsDeleting] = useState({});
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const sliderRef = useRef(null);
    const videoRefs = useRef([]);
    const loadTime = useRef(new Date());

    // Lấy chi tiết bài viết và bình luận khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Post ID:', postId);
                const post = await fetchPostDetailAPI(postId);
                console.log('Post Detail:', post);
                setPostDetail(post);
                setPostTime(timeAgo(post.createdAt, loadTime.current));

                // Lấy danh sách bình luận
                const commentsData = await fetchCommentsByPostAPI(postId);
                console.log('Comments Data:', commentsData);
                setComments(Array.isArray(commentsData) ? commentsData : []);
            } catch (error) {
                console.error('Error fetching post detail:', error);
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to load post. Please try again.',
                    placement: 'topRight',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [postId]);

    // Cập nhật thời gian bình luận
    useEffect(() => {
        if (comments && comments.length > 0) {
            const now = new Date();
            const updatedCommentTimes = comments.map(comment =>
                timeAgo(comment.createdAt, now)
            );
            setCommentTimes(updatedCommentTimes);
        }
    }, [comments]);

    // Kiểm tra trạng thái like của bài viết
    const isLiked = postDetail?.likes?.some(like => like._id === userId) || false;

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        touchMove: true,
        customPaging: (i) => (
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50 mx-1 transition-opacity duration-300" />
        ),
        dotsClass: "slick-dots absolute bottom-2 flex justify-center w-full",
        beforeChange: (current, next) => {
            handleVideoPause(current);
            setCurrentSlide(next);
        },
        afterChange: (current) => {
            handleVideoPlay(current);
        },
    };

    const handleVideoPause = (current) => {
        const video = videoRefs.current[current];
        if (video) {
            video.pause();
        }
    };

    const handleVideoPlay = (current) => {
        const video = videoRefs.current[current];
        if (video && postDetail?.mediaFiles[current]?.type === 'video') {
            video.muted = isMuted;
            video.play().catch(error => console.log("Video play error:", error));
        }
    };

    const toggleMute = () => {
        const video = videoRefs.current[currentSlide];
        if (video) {
            const newMutedState = !video.muted;
            video.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    const handlePrev = () => sliderRef.current.slickPrev();
    const handleNext = () => sliderRef.current.slickNext();

    const showLoginNotification = () => {
        notification.warning({
            message: 'Authentication Required',
            description: 'Please log in to interact with posts, or continue viewing without interaction.',
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

    const handleLikeToggle = async () => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        try {
            if (isLiked) {
                await unlikePostAPI(postId, userId);
            } else {
                await likePostAPI(postId, userId);
            }

            // Like/Unlike xong, fetch lại bài viết mới nhất
            const updatedPost = await fetchPostDetailAPI(postId);
            setPostDetail(updatedPost);
        } catch (error) {
            console.error('Error toggling like:', error);
            notification.error({
                message: 'Error',
                description: error?.message || error?.response?.data?.message || 'Failed to like/unlike post. Please try again.',
                placement: 'topRight',
            });
        }
    };

    // Xử lý like/unlike bình luận
    const handleLikeComment = async (commentId) => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        const comment = comments.find(c => c._id === commentId);
        const isCommentLiked = comment?.likes?.some(like => (like._id || like) === userId) || false;
        try {
            if (isCommentLiked) {
                await unlikeCommentAPI(commentId, userId);
            } else {
                await likeCommentAPI(commentId, userId);
            }
            // Làm mới danh sách bình luận
            const updatedComments = await fetchCommentsByPostAPI(postId);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
        } catch (error) {
            console.error('Error toggling comment like:', error);
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to like/unlike comment. Please try again.',
                placement: 'topRight',
            });
        }
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId) => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        if (isDeleting[commentId]) return;
        setIsDeleting(prev => ({ ...prev, [commentId]: true }));
        try {
            await deleteCommentAPI(commentId);
            notification.success({
                message: 'Comment Deleted',
                description: 'Your comment has been successfully deleted.',
                placement: 'topRight',
            });
            // Làm mới danh sách bình luận
            const updatedComments = await fetchCommentsByPostAPI(postId);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
        } catch (error) {
            console.error('Error deleting comment:', error);
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to delete comment. Please try again.',
                placement: 'topRight',
            });
        } finally {
            setIsDeleting(prev => ({ ...prev, [commentId]: false }));
        }
    };

    // Menu cho tùy chọn xóa bình luận
    const commentMenu = (commentId) => (
        <Menu>
            <Menu.Item
                key="delete"
                onClick={() => handleDeleteComment(commentId)}
                danger
                disabled={isDeleting[commentId]}
            >
                {isDeleting[commentId] ? 'Deleting...' : 'Delete'}
            </Menu.Item>
            <Menu.Item key="cancel">
                Cancel
            </Menu.Item>
        </Menu>
    );

    const handleComment = async () => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        if (commentText.trim()) {
            try {
                console.log('Gửi comment với dữ liệu:', {
                    post: postId,
                    user: userId,
                    text: commentText
                });
                const newComment = await createCommentAPI(postId, userId, commentText);
                console.log('API trả về:', newComment);

                if (newComment && newComment._id) {
                    setComments(prev => [newComment, ...prev]);
                    setCommentTimes(prev => ['0s', ...prev]);
                    setCommentText(''); // Reset input sau khi gửi comment
                }
            } catch (error) {
                console.error('Error adding comment:', error);
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to add comment. Please try again.',
                    placement: 'topRight',
                });
            }
        }
    };

    // Xử lý hiển thị popup chia sẻ
    const showShareModal = () => {
        setIsShareModalVisible(true);
    };

    const handleShareModalCancel = () => {
        setIsShareModalVisible(false);
    };

    // Reset video refs khi postDetail thay đổi
    useEffect(() => {
        videoRefs.current = [];
    }, [postDetail]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!postDetail) {
        return <div className="flex justify-center items-center min-h-screen">Post not found</div>;
    }

    const shareLink = `${window.location.origin}/posts/${postId}`;

    return (
        <div className="max-w-5xl mx-auto mt-8 flex h-[80vh]">
            {/* Left Side: Media - Ẩn trên màn hình nhỏ */}
            <div className="hidden md:block w-3/5 h-full bg-black relative">
                <Slider ref={sliderRef} {...sliderSettings}>
                    {postDetail.mediaFiles.map((media, index) => (
                        <div key={index} className="w-full h-[80vh] relative">
                            {media.type === 'image' ? (
                                <img
                                    src={media.url}
                                    alt={`post-media-${index}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <>
                                    <video
                                        ref={(el) => (videoRefs.current[index] = el)}
                                        src={media.url}
                                        className="w-full h-full object-contain"
                                        loop
                                        playsInline
                                    />
                                    <button
                                        className="absolute bottom-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </Slider>
                {postDetail.mediaFiles.length > 1 && (
                    <>
                        {currentSlide !== 0 && (
                            <button
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                                onClick={handlePrev}
                            >
                                <LeftOutlined className="text-black text-sm" />
                            </button>
                        )}
                        {currentSlide !== postDetail.mediaFiles.length - 1 && (
                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                                onClick={handleNext}
                            >
                                <RightOutlined className="text-black text-sm" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Right Side: Comments */}
            <div className="w-full md:w-2/5 h-full flex flex-col">
                {/* Post Header */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <Avatar
                        src={postDetail.author?.avatar || `https://i.pravatar.cc/150?u=${postDetail.author?._id}`}
                        icon={<UserOutlined />}
                        className="border-2 border-pink-500 p-0.5 rounded-full"
                        size={32}
                    />
                    <div className="ml-3 flex flex-col">
                        <span className="font-semibold text-black">{postDetail.author?.username || `user${postDetail.author?._id}`}</span>
                        <span className="text-xs text-gray-400">{postTime}</span>
                    </div>
                </div>

                {/* Caption and Comments */}
                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 280px)' }}>
                    {/* Caption */}
                    <div className="flex items-center mb-4">
                        <Avatar
                            src={postDetail.author?.avatar || `https://i.pravatar.cc/150?u=${postDetail.author?._id}`}
                            icon={<UserOutlined />}
                            size={24}
                            className="mr-2"
                        />
                        <div className="flex flex-col">
                            <div>
                                <span className="font-semibold mr-2 text-black">{postDetail.author?.username || `user${postDetail.author?._id}`}</span>
                                <span>{postDetail.caption}</span>
                            </div>
                            <span className="text-xs text-gray-400">{postTime}</span>
                        </div>
                    </div>

                    {/* Comments List */}
                    {comments && comments.length > 0 ? (
                        comments.map((comment, index) => {
                            const isCommentLiked = comment.likes?.some(like => (like._id || like) === userId) || false;
                            const likeCount = comment.likes?.length || 0;
                            const isCommentOwner = typeof comment.user === 'object' ? comment.user?._id === userId : comment.user === userId;
                            let likeText = '';
                            if (likeCount === 1) {
                                likeText = '1 like';
                            } else if (likeCount > 1) {
                                likeText = `${likeCount} likes`;
                            }

                            return (
                                <div key={comment._id} className="flex items-start mb-4 hover:bg-gray-50 transition-colors duration-200 group">
                                    <div className="mr-2">
                                        <Avatar
                                            src={typeof comment.user === 'object' ? (comment.user?.profile?.avatar || `https://i.pravatar.cc/150?u=${comment.user?._id}`) : `https://i.pravatar.cc/150?u=${comment.user}`}
                                            icon={<UserOutlined />}
                                            size={24}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold mr-2">
                                                    {typeof comment.user === 'object' ? (comment.user?.username || `user${comment.user?._id}`) : `user${comment.user}`}
                                                </span>
                                                <span>{comment.text}</span>
                                            </div>
                                            <span
                                                className="cursor-pointer ml-4"
                                                onClick={() => handleLikeComment(comment._id)}
                                            >
                                                {isCommentLiked ? (
                                                    <HeartFilled className="text-red-500 text-lg" />
                                                ) : (
                                                    <HeartOutlined className="text-gray-600 text-lg" />
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-1 ml-1">
                                            <span className="text-xs text-gray-400">{commentTimes[index]}</span>
                                            {likeText && (
                                                <span className="text-xs text-gray-600 ml-2 min-w-[50px]">{likeText}</span>
                                            )}
                                            {isCommentOwner && (
                                                <Dropdown menu={commentMenu(comment._id)} trigger={['click']}>
                                                    <span className="ml-2 cursor-pointer text-gray-600 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <IoIosMore />
                                                    </span>
                                                </Dropdown>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                </div>

                {/* Likes and Actions */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-between text-2xl mb-2">
                        <div className="flex gap-3">
                            {isLiked ? (
                                <HeartFilled
                                    className="cursor-pointer text-red-500 hover:text-gray-400"
                                    onClick={handleLikeToggle}
                                />
                            ) : (
                                <HeartOutlined
                                    className="cursor-pointer text-black hover:text-gray-400"
                                    onClick={handleLikeToggle}
                                />
                            )}
                            <MessageOutlined className="text-black hover:text-gray-400" />
                            <SendOutlined
                                className="text-black hover:text-gray-400 cursor-pointer"
                                onClick={showShareModal}
                            />
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-black">
                        {postDetail.likes.length} likes
                    </div>
                </div>

                {/* Share Modal */}
                <Modal
                    title="Share Post"
                    open={isShareModalVisible}
                    onCancel={handleShareModalCancel}
                    footer={null}
                    centered
                    width={400}
                >
                    <div className="flex flex-col gap-4">
                        {/* Copy Link Section */}
                        <div className="flex items-center bg-gray-100 p-2 rounded">
                            <Input
                                value={shareLink}
                                readOnly
                                className="flex-1 mr-2 border-none bg-transparent"
                            />
                            <Button
                                type="primary"
                                onClick={() => copyToClipboard(shareLink)}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <Input
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onPressEnter={handleComment}
                            className="flex-1 mr-2 border-none focus:ring-0"
                        />
                        <Button
                            type="primary"
                            onClick={handleComment}
                            disabled={!commentText.trim()}
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;