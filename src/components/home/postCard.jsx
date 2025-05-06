import { Card, Avatar, Modal, Button, Input, Menu, Dropdown, notification, Select } from 'antd';
import { BarsOutlined, HeartOutlined, HeartFilled, MessageOutlined, SendOutlined, UserOutlined, LeftOutlined, RightOutlined, SoundOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { FiBookmark } from 'react-icons/fi';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../styles/home.css';
import { useDispatch, useSelector } from 'react-redux';
import { deleteComment, fetchComments, likeComment, unlikeComment, resetComments } from '../../redux/post/postsSlice';
import { IoIosMore } from 'react-icons/io';
import ProfileCard from './ProfileCard ';
import { reportPostAPI } from '../../services/report.service';

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

function PostCard({ post: initialPost, userId, onLikeToggle, onComment }) {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.posts.posts);
    const status = useSelector((state) => state.posts.status);
    const post = posts.find(p => p._id === initialPost._id) || initialPost;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [postTime, setPostTime] = useState('');
    const [commentTimes, setCommentTimes] = useState([]);
    const [sortedComments, setSortedComments] = useState([]); // Danh sách bình luận đã sắp xếp
    const sliderRef = useRef(null);
    const commentSliderRef = useRef(null);
    const cardRef = useRef(null);
    const videoRefs = useRef([]);
    const commentVideoRefs = useRef([]);
    const isLiked = post.likes.some(like => like._id === userId);
    const loadTime = useRef(new Date());
    const [showProfileCard, setShowProfileCard] = useState(false);
    const profileCardTimeoutRef = useRef(null);
    const [authorState, setAuthorState] = useState(post.author);

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

    const showCommentModal = () => {
        dispatch(resetComments({ postId: post._id })); // Reset bình luận
        dispatch(fetchComments({ postId: post._id, page: 1 })); // Tải trang đầu tiên
        setIsCommentModalOpen(true);
    };
    const handleCommentModalOk = () => setIsCommentModalOpen(false);
    const handleCommentModalCancel = () => {
        setIsCommentModalOpen(false);
        dispatch(resetComments({ postId: post._id })); // Reset bình luận khi đóng modal
    };

    const showShareModal = () => {
        setIsShareModalVisible(true);
    };
    const handleShareModalCancel = () => {
        setIsShareModalVisible(false);
    };

    const showReportModal = () => {
        setIsModalOpen(false);
        setIsReportModalOpen(true);
    };
    const handleReportModalOk = async () => {
        if (!reportReason) {
            notification.error({
                message: 'Report Failed',
                description: 'Please select a reason for reporting.',
                placement: 'topRight',
            });
            return;
        }

        setReportLoading(true);
        try {
            await reportPostAPI(post._id, userId, reportReason, reportDescription);
            setIsReportModalOpen(false);
            setReportReason('');
            setReportDescription('');
            notification.success({
                message: 'Report Submitted',
                description: 'Thanks for reporting this post. We will review it soon.',
                placement: 'topRight',
            });
        } catch (err) {
            console.error('Error reporting post:', err);
            notification.error({
                message: 'Report Failed',
                description: err.message || 'Failed to submit the report. Please try again.',
                placement: 'topRight',
            });
        } finally {
            setReportLoading(false);
        }
    };
    const handleReportModalCancel = () => {
        setIsReportModalOpen(false);
        setReportReason('');
        setReportDescription('');
    };

    // Xử lý sao chép liên kết
    const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/posts/${post._id}`;
        copyToClipboard(shareLink);
        setIsModalOpen(false);
    };

    // Xử lý đi đến bài viết
    const handleGoToPost = () => {
        const shareLink = `${window.location.origin}/posts/${post._id}`;
        window.open(shareLink, '_blank');
        setIsModalOpen(false);
    };

    // Xử lý tải thêm bình luận
    const handleLoadMoreComments = () => {
        dispatch(fetchComments({ postId: post._id, page: post.currentCommentPage + 1 }));
    };

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
        dotsClass: "slick-dots custom-dots",
        beforeChange: (current, next) => {
            handleVideoPause(current, videoRefs);
            handleVideoPause(current, commentVideoRefs);
            setCurrentSlide(next);
        },
        afterChange: (current) => {
            handleVideoPlay(current, videoRefs);
            handleVideoPlay(current, commentVideoRefs);
        },
    };

    const handleVideoPause = (current, refs = videoRefs) => {
        const video = refs.current[current];
        if (video) {
            video.pause();
        }
    };

    const handleVideoPlay = (current, refs = videoRefs) => {
        const video = refs.current[current];
        if (video && post.mediaFiles[current].type === 'video') {
            video.muted = isMuted;
            video.play().catch(error => console.log("Video play error:", error));
        }
    };

    const toggleMute = (refs = videoRefs) => {
        const video = refs.current[currentSlide];
        if (video) {
            const newMutedState = !video.muted;
            video.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    const handlePrev = (ref = sliderRef) => ref.current.slickPrev();
    const handleNext = (ref = sliderRef) => ref.current.slickNext();

    const handleLikeClick = () => {
        onLikeToggle(post._id, isLiked);
    };

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            onComment(post._id, commentText);
            setCommentText('');
            // Không cần thêm '0s' vào commentTimes ở đây, sẽ xử lý trong useEffect
        }
    };

    // Xử lý like/unlike comment
    const handleLikeComment = (commentId) => {
        const comment = post.comments.find(c => c._id === commentId);
        const isCommentLiked = comment?.likes?.some(like => (like._id || like) === userId) || false;
        if (isCommentLiked) {
            dispatch(unlikeComment({ postId: post._id, commentId, userId }));
        } else {
            dispatch(likeComment({ postId: post._id, commentId, userId }));
        }
        setTimeout(() => {
            dispatch(fetchComments({ postId: post._id, page: post.currentCommentPage }));
        }, 100);
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = (commentId) => {
        dispatch(deleteComment({ postId: post._id, commentId }));
    };

    // Menu cho tùy chọn bài viết
    const postMenu = (
        <Menu>
            <Menu.Item key="report" onClick={showReportModal}>
                Report
            </Menu.Item>
            <Menu.Item key="copyLink" onClick={handleCopyLink}>
                Copy Link
            </Menu.Item>
            <Menu.Item key="goToPost" onClick={handleGoToPost}>
                Go to Post
            </Menu.Item>
        </Menu>
    );

    // Menu cho tùy chọn xóa bình luận
    const commentMenu = (commentId) => ({
        items: [
            {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteComment(commentId),
            },
            {
                key: 'cancel',
                label: 'Cancel',
            },
        ],
    });

    const handleVisibilityChange = useCallback((entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) {
            videoRefs.current.forEach((video) => {
                if (video) {
                    video.muted = true;
                    video.pause();
                    setIsMuted(true);
                }
            });
        } else {
            handleVideoPlay(currentSlide, videoRefs);
        }
    }, [currentSlide, post.mediaFiles]);

    // Cập nhật thời gian bài đăng
    useEffect(() => {
        setPostTime(timeAgo(post.createdAt, loadTime.current));
    }, [post]);

    // Sắp xếp bình luận và cập nhật thời gian
    useEffect(() => {
        if (isCommentModalOpen) {
            // Sắp xếp bình luận:
            // - Bình luận của userId lên đầu, sắp xếp theo thời gian (mới nhất trước)
            // - Các bình luận khác theo thời gian (mới nhất trước)
            const sorted = [...post.comments].sort((a, b) => {
                if (a.user?._id === userId && b.user?._id === userId) {
                    // Cùng là bình luận của userId, sắp xếp theo thời gian (mới nhất trước)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (a.user?._id === userId && b.user?._id !== userId) return -1;
                if (a.user?._id !== userId && b.user?._id === userId) return 1;
                // Các bình luận khác, sắp xếp theo thời gian (mới nhất trước)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setSortedComments(sorted);

            // Cập nhật thời gian bình luận
            const now = new Date();
            const updatedCommentTimes = sorted.map(comment =>
                timeAgo(comment.createdAt, now)
            );
            setCommentTimes(updatedCommentTimes);

            if (commentSliderRef.current) {
                commentSliderRef.current.slickGoTo(currentSlide);
                setTimeout(() => {
                    handleVideoPlay(currentSlide, commentVideoRefs);
                }, 100);
            }
        } else {
            handleVideoPause(currentSlide, commentVideoRefs);
        }
    }, [isCommentModalOpen, post.comments, currentSlide, userId]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleVisibilityChange, {
            root: null,
            threshold: 0.5,
        });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => {
            if (cardRef.current) observer.unobserve(cardRef.current);
        };
    }, [handleVisibilityChange]);

    useEffect(() => {
        videoRefs.current = [];
        commentVideoRefs.current = [];
    }, [post]);

    // Xử lý hover cho ProfileCard
    const handleMouseEnter = () => {
        if (profileCardTimeoutRef.current) {
            clearTimeout(profileCardTimeoutRef.current);
        }
        setShowProfileCard(true);
    };

    const handleMouseLeave = () => {
        profileCardTimeoutRef.current = setTimeout(() => {
            setShowProfileCard(false);
        }, 200);
    };

    const shareLink = `${window.location.origin}/posts/${post._id}`;

    return (
        <div className="border-b border-gray-200 pb-4 bg-white" ref={cardRef}>
            {/* Header */}
            <div className="flex items-center px-3 py-2 justify-between text-sm font-semibold">
                <div className="flex items-center">
                    <Avatar
                        src={post.author?.avatar || `https://i.pravatar.cc/150?u=${post.author?._id}`}
                        icon={<UserOutlined />}
                        className="border-2 border-pink-500 p-0.5 rounded-full"
                        size={32}
                    />
                    <div className="ml-3 flex flex-col">
                        <div
                            className="relative group"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="font-semibold text-black cursor-pointer">{post.author?.username}</span>
                            {showProfileCard && (
                                <div
                                    className="absolute z-50 top-6 left-0"
                                    onMouseEnter={() => clearTimeout(profileCardTimeoutRef.current)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <ProfileCard user={authorState} onFollowChange={(newAuthor) => setAuthorState(newAuthor)} />
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">{postTime}</span>
                    </div>
                </div>
                <Dropdown overlay={postMenu} trigger={['click']}>
                    <IoIosMore className="text-lg text-black cursor-pointer" />
                </Dropdown>
            </div>

            {/* Report Modal */}
            <Modal
                title="Report Post"
                open={isReportModalOpen}
                onOk={handleReportModalOk}
                onCancel={handleReportModalCancel}
                okText="Submit"
                cancelText="Cancel"
                confirmLoading={reportLoading}
                centered
            >
                <div className="flex flex-col gap-4">
                    <Select
                        placeholder="Select a reason"
                        value={reportReason}
                        onChange={(value) => setReportReason(value)}
                        options={[
                            { value: 'spam', label: 'Spam' },
                            { value: 'inappropriate', label: 'Inappropriate content' },
                            { value: 'harassment', label: 'Harassment or bullying' },
                            { value: 'hate_speech', label: 'Hate speech' },
                            { value: 'violence', label: 'Violence or dangerous organizations' },
                            { value: 'misinformation', label: 'False information' },
                        ]}
                        className="w-full"
                    />
                    <Input.TextArea
                        placeholder="Provide additional details (optional)"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        rows={4}
                    />
                </div>
            </Modal>

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

            {/* Comment Modal */}
            <Modal
                closable={true}
                centered={true}
                open={isCommentModalOpen}
                onOk={handleCommentModalOk}
                onCancel={handleCommentModalCancel}
                width="80%"
                styles={{ padding: 0, height: '80vh' }}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}
                style={{ padding: 0 }}
            >
                <div className="flex h-full">
                    <div className="hidden md:block w-3/5 h-full bg-black relative">
                        <Slider ref={commentSliderRef} {...sliderSettings}>
                            {post.mediaFiles.map((media, index) => (
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
                                                ref={(el) => (commentVideoRefs.current[index] = el)}
                                                src={media.url}
                                                className="w-full h-full object-contain"
                                                loop
                                                playsInline
                                            />
                                            <button
                                                className="absolute bottom-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
                                                onClick={() => toggleMute(commentVideoRefs)}
                                            >
                                                {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </Slider>
                        {post.mediaFiles.length > 1 && (
                            <>
                                {currentSlide !== 0 && (
                                    <button
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                                        onClick={() => handlePrev(commentSliderRef)}
                                    >
                                        <LeftOutlined className="text-black text-sm" />
                                    </button>
                                )}
                                {currentSlide !== post.mediaFiles.length - 1 && (
                                    <button
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                                        onClick={() => handleNext(commentSliderRef)}
                                    >
                                        <RightOutlined className="text-black text-sm" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="w-full md:w-2/5 h-full flex flex-col">
                        <div className="flex items-center p-4 border-b border-gray-200">
                            <Avatar
                                src={post.author?.avatar || `https://i.pravatar.cc/150?u=${post.author?._id}`}
                                icon={<UserOutlined />}
                                className="border-2 border-pink-500 p-0.5 rounded-full"
                                size={32}
                            />
                            <div className="ml-3 flex flex-col">
                                <span className="font-semibold text-black">{post.author?.username || `user${post.author?._id}`}</span>
                                <span className="text-xs text-gray-400">{postTime}</span>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 280px)' }}>
                            <div className="flex items-center mb-4">
                                <Avatar
                                    src={post.author?.avatar || `https://i.pravatar.cc/150?u=${post.author?._id}`}
                                    icon={<UserOutlined />}
                                    size={24}
                                    className="mr-2"
                                />
                                <div className="flex flex-col">
                                    <div>
                                        <span className="font-semibold mr-2 text-black">{post.author?.username || `user${post.author?._id}`}</span>
                                        <span>{post.caption}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{postTime}</span>
                                </div>
                            </div>

                            {sortedComments.map((comment, index) => {
                                const isCommentLiked = comment.likes?.some(like => (like._id || like) === userId) || false;
                                const likeCount = comment.likes?.length || 0;
                                const isCommentOwner = comment.user?._id === userId;
                                let likeText = '';
                                if (likeCount === 1) {
                                    likeText = '1 like';
                                } else if (likeCount > 1) {
                                    likeText = `${likeCount} likes`;
                                }

                                return (
                                    <div
                                        key={comment._id}
                                        className="flex items-start mb-5 group relative"
                                    >
                                        <div className="mr-3">
                                            <Avatar
                                                src={comment.user?.profile?.avatar || `https://i.pravatar.cc/150?u=${comment.user?._id}`}
                                                icon={<UserOutlined />}
                                                size={32}
                                            />
                                        </div>
                                        <div className="flex-1 text-[15px] leading-snug">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-semibold mr-2">{comment.user?.username || `user${comment.user?._id}`}</span>
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
                                            <div className="flex items-center mt-1 ml-1 relative text-[13px] text-gray-500">
                                                <span>{commentTimes[index]}</span>
                                                <span className="ml-2 min-w-[40px]">{likeText || ''}</span>
                                                {isCommentOwner && (
                                                    <Dropdown menu={commentMenu(comment._id)} trigger={['click']}>
                                                        <span className="ml-2 cursor-pointer font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <IoIosMore />
                                                        </span>
                                                    </Dropdown>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Nút Load More và trạng thái loading */}
                            {post.hasMoreComments && (
                                <div className="text-center mt-4">
                                    <Button
                                        type="link"
                                        onClick={handleLoadMoreComments}
                                        loading={status === 'loading'}
                                        className="load-more-button"
                                    >
                                        Load more comments
                                    </Button>
                                </div>
                            )}
                            {!post.hasMoreComments && sortedComments.length > 0 && (
                                <div className="no-more-comments">
                                    No more comments to load
                                </div>
                            )}
                            {status === 'failed' && (
                                <div className="text-center mt-4 text-red-500">
                                    Error loading comments
                                    <Button
                                        type="link"
                                        onClick={() => dispatch(fetchComments({ postId: post._id, page: post.currentCommentPage }))}
                                    >
                                        Try again
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <div className="flex justify-between text-2xl mb-2">
                                <div className="flex gap-3">
                                    {isLiked ? (
                                        <HeartFilled
                                            className="cursor-pointer text-red-500 hover:text-gray-400"
                                            onClick={handleLikeClick}
                                        />
                                    ) : (
                                        <HeartOutlined
                                            className="cursor-pointer text-black hover:text-gray-400"
                                            onClick={handleLikeClick}
                                        />
                                    )}
                                    <MessageOutlined
                                        className="text-black hover:text-gray-400 cursor-pointer"
                                        onClick={showCommentModal}
                                    />
                                    <SendOutlined
                                        className="text-black hover:text-gray-400 cursor-pointer"
                                        onClick={showShareModal}
                                    />
                                </div>
                                <FiBookmark className="text-black hover:text-gray-400" />
                            </div>
                            <div className="text-sm font-semibold text-black">
                                {post.likes.length} likes
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <div className="flex items-center">
                                <Input
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onPressEnter={handleCommentSubmit}
                                    className="flex-1 mr-2"
                                />
                                <Button
                                    type="primary"
                                    onClick={handleCommentSubmit}
                                    disabled={!commentText.trim()}
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Post Media Carousel */}
            <div className="relative">
                <Slider ref={sliderRef} {...sliderSettings}>
                    {post.mediaFiles.map((media, index) => (
                        <div key={index} className="w-full h-[585px] relative">
                            {media.type === 'image' ? (
                                <img
                                    src={media.url}
                                    alt={`post-media-${index}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <video
                                        ref={(el) => (videoRefs.current[index] = el)}
                                        src={media.url}
                                        className="w-full h-full object-cover"
                                        loop
                                        playsInline
                                    />
                                    <button
                                        className="absolute bottom-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
                                        onClick={() => toggleMute(videoRefs)}
                                    >
                                        {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </Slider>
                {post.mediaFiles.length > 1 && (
                    <>
                        {currentSlide !== 0 && (
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                onClick={() => handlePrev(sliderRef)}
                            >
                                <LeftOutlined className="text-black text-sm" />
                            </button>
                        )}
                        {currentSlide !== post.mediaFiles.length - 1 && (
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                onClick={() => handleNext(sliderRef)}
                            >
                                <RightOutlined className="text-black text-sm" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Action Icons */}
            <div className="flex justify-between px-3 pt-2 text-2xl">
                <div className="flex gap-3">
                    {isLiked ? (
                        <HeartFilled
                            className="cursor-pointer text-red-500 hover:text-gray-400"
                            onClick={handleLikeClick}
                        />
                    ) : (
                        <HeartOutlined
                            className="cursor-pointer text-black hover:text-gray-400"
                            onClick={handleLikeClick}
                        />
                    )}
                    <MessageOutlined
                        className="text-black hover:text-gray-400 cursor-pointer"
                        onClick={showCommentModal}
                    />
                    <SendOutlined
                        className="text-black hover:text-gray-400 cursor-pointer"
                        onClick={showShareModal}
                    />
                </div>
                <FiBookmark className="text-black hover:text-gray-400" />
            </div>

            {/* Likes */}
            <div className="px-3 pt-1 text-sm font-semibold text-black">
                {post.likes.length} likes
            </div>

            {/* Caption */}
            <div className="px-3 pt-1 pb-2 text-sm">
                <span className="font-semibold mr-2 text-black">{post.author?.username || `user${post.author?._id}`}</span>
                <span className="text-black">{post.caption}</span>
            </div>

            {/* Optional: Show a preview of comments */}
            {post.comments.length > 0 && (
                <div className="px-3 text-sm text-gray-600">
                    <div className="cursor-pointer" onClick={showCommentModal}>
                        View all {post.comments.length} comments
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostCard;