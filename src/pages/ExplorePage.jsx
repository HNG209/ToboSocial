import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Grid3X3 } from 'lucide-react';
import { Avatar, Button, Input, Menu, Dropdown, notification, Modal } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, SendOutlined, UserOutlined, LeftOutlined, RightOutlined, SoundOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { IoIosMore } from 'react-icons/io';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
    fetchPostsAPI,
    fetchPostDetailAPI,
    fetchCommentsByPostAPI,
    likePostAPI,
    unlikePostAPI,
    createCommentAPI,
    deleteCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
} from '../services/api.service';
import { useSelector } from 'react-redux';

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

const ExplorePage = () => {
    const userId = useSelector((state) => state.auth.user?._id);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const [currentPostPage, setCurrentPostPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [sortedComments, setSortedComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [currentCommentPage, setCurrentCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentError, setCommentError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [postTime, setPostTime] = useState('');
    const [commentTimes, setCommentTimes] = useState([]);
    const [isDeleting, setIsDeleting] = useState({});
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const sliderRef = useRef(null);
    const videoRefs = useRef([]);
    const commentSectionRef = useRef(null);
    const postSectionRef = useRef(null);
    const loadTime = useRef(new Date());
    const postLimit = 12;
    const commentLimit = 10;
    const postObserverRef = useRef(null);
    const commentObserverRef = useRef(null);
    const loadMorePostsRef = useRef(null);
    const loadMoreCommentsRef = useRef(null);

    // Tải danh sách bài viết
    const fetchPosts = async (page) => {
        try {
            setPostLoading(true);
            setPostError(null);
            console.log(`Fetching posts, page ${page}, limit ${postLimit}`);
            const postsData = await fetchPostsAPI(page, postLimit);
            console.log('Posts Data:', postsData);
            if (!Array.isArray(postsData)) {
                throw new Error('Invalid posts data format');
            }
            const newPosts = postsData.map(post => ({
                ...post,
                likes: post?.likes || [],
                mediaFiles: post?.mediaFiles || [],
            }));
            setPosts(prev => (page === 1 ? newPosts : [...prev, ...newPosts]));
            setHasMorePosts(newPosts.length === postLimit);
            setCurrentPostPage(page);
            console.log(`Updated posts state: ${newPosts.length} new posts, total: ${page === 1 ? newPosts.length : posts.length + newPosts.length}`);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPostError(error.message || 'Failed to load posts. Please try again.');
        } finally {
            setPostLoading(false);
            setLoading(false);
        }
    };

    // Tải bài viết lần đầu
    useEffect(() => {
        setLoading(true);
        fetchPosts(1);
    }, []);

    // Infinite scroll cho bài viết
    const loadMorePosts = useCallback(async () => {
        if (!hasMorePosts || postLoading || postError) {
            console.log('Load more posts skipped:', { hasMorePosts, postLoading, postError });
            return;
        }
        console.log(`Triggering load more posts for page ${currentPostPage + 1}`);
        await fetchPosts(currentPostPage + 1);
    }, [hasMorePosts, postLoading, postError, currentPostPage]);

    useEffect(() => {
        if (!loadMorePostsRef.current) {
            console.log('Post IntersectionObserver not initialized: loadMorePostsRef missing');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log('Load more posts trigger intersected');
                    loadMorePosts();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMorePostsRef.current);
        postObserverRef.current = observer;

        return () => {
            if (postObserverRef.current) {
                postObserverRef.current.disconnect();
                console.log('Post IntersectionObserver disconnected');
            }
        };
    }, [loadMorePosts]);

    // Hàm tải bình luận
    const fetchComments = async (postId, page) => {
        try {
            setCommentLoading(true);
            setCommentError(null);
            console.log(`Fetching comments for post ${postId}, page ${page}, limit ${commentLimit}`);
            const commentsData = await fetchCommentsByPostAPI(postId, page, commentLimit);
            console.log('Comments Data:', commentsData);
            if (!Array.isArray(commentsData)) {
                throw new Error('Invalid comments data format');
            }
            const newComments = commentsData;
            setComments(prev => (page === 1 ? newComments : [...prev, ...newComments]));
            setHasMoreComments(newComments.length === commentLimit);
            setCurrentCommentPage(page);
            console.log(`Updated comments state: ${newComments.length} new comments, total: ${page === 1 ? newComments.length : comments.length + newComments.length}`);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setCommentError(error.message || 'Failed to load comments. Please try again.');
        } finally {
            setCommentLoading(false);
        }
    };

    // Sắp xếp bình luận
    useEffect(() => {
        console.log('Comments State:', comments);
        if (comments.length > 0) {
            const sorted = [...comments].sort((a, b) => {
                const aUserId = typeof a.user === 'object' ? a.user?._id : a.user;
                const bUserId = typeof b.user === 'object' ? b.user?._id : b.user;
                if (aUserId === userId && bUserId === userId) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (aUserId === userId && bUserId !== userId) return -1;
                if (aUserId !== userId && bUserId === userId) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setSortedComments(sorted);
            const now = new Date();
            const updatedCommentTimes = sorted.map(comment => timeAgo(comment.createdAt, now));
            setCommentTimes(updatedCommentTimes);
        } else {
            setSortedComments([]);
            setCommentTimes([]);
        }
    }, [comments, userId]);

    // Theo dõi cuộn để hiển thị input bình luận
    useEffect(() => {
        const handleScroll = () => {
            if (commentSectionRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = commentSectionRef.current;
                console.log(`Comment scroll position: scrollTop=${scrollTop}, scrollHeight=${scrollHeight}, clientHeight=${clientHeight}`);
                if (scrollHeight - scrollTop - clientHeight < 50) {
                    setIsCommentInputVisible(true);
                } else {
                    setIsCommentInputVisible(false);
                }
            }
        };
        const commentSection = commentSectionRef.current;
        if (commentSection) {
            commentSection.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (commentSection) {
                commentSection.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isPostModalOpen]);

    // Infinite scroll cho bình luận
    const loadMoreComments = useCallback(async () => {
        if (!selectedPost || !hasMoreComments || commentLoading || commentError) {
            console.log('Load more comments skipped:', { selectedPost: !!selectedPost, hasMoreComments, commentLoading, commentError });
            return;
        }
        console.log(`Triggering load more comments for page ${currentCommentPage + 1}`);
        await fetchComments(selectedPost._id, currentCommentPage + 1);
    }, [selectedPost, hasMoreComments, commentLoading, commentError, currentCommentPage]);

    useEffect(() => {
        if (!isPostModalOpen || !loadMoreCommentsRef.current) {
            console.log('Comment IntersectionObserver not initialized:', { isPostModalOpen, loadMoreCommentsRef: !!loadMoreCommentsRef.current });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log('Load more comments trigger intersected');
                    loadMoreComments();
                }
            },
            { threshold: 0.1, root: commentSectionRef.current }
        );

        observer.observe(loadMoreCommentsRef.current);
        commentObserverRef.current = observer;

        return () => {
            if (commentObserverRef.current) {
                commentObserverRef.current.disconnect();
                console.log('Comment IntersectionObserver disconnected');
            }
        };
    }, [isPostModalOpen, loadMoreComments]);

    // Mở modal chi tiết bài viết
    const openPostModal = async (post) => {
        try {
            const postDetail = await fetchPostDetailAPI(post._id);
            console.log('Post Detail:', postDetail);
            setSelectedPost({
                ...postDetail,
                likes: postDetail?.likes || [],
                mediaFiles: postDetail?.mediaFiles || [],
                author: postDetail?.author || { _id: '', username: '' },
                caption: postDetail?.caption || '',
                createdAt: postDetail?.createdAt || new Date(),
            });
            setPostTime(timeAgo(postDetail?.createdAt || new Date(), loadTime.current));
            setCurrentCommentPage(1);
            setHasMoreComments(true);
            await fetchComments(postDetail._id, 1);
            setIsPostModalOpen(true);
        } catch (error) {
            console.error('Error fetching post detail:', error);
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to load post details.',
                placement: 'topRight',
            });
        }
    };

    // Đóng modal
    const handlePostModalCancel = () => {
        setIsPostModalOpen(false);
        setSelectedPost(null);
        setComments([]);
        setSortedComments([]);
        setCommentText('');
        setIsCommentInputVisible(false);
        videoRefs.current.forEach(video => video?.pause());
    };

    // Xử lý like/unlike bài viết
    const handleLikeToggle = async () => {
        if (!selectedPost) return;
        try {
            const isLiked = selectedPost?.likes?.some(like => like._id === userId || like === userId);
            if (isLiked) {
                await unlikePostAPI(selectedPost._id, userId);
            } else {
                await likePostAPI(selectedPost._id, userId);
            }
            const updatedPost = await fetchPostDetailAPI(selectedPost._id);
            setSelectedPost({
                ...updatedPost,
                likes: updatedPost?.likes || [],
                mediaFiles: updatedPost?.mediaFiles || [],
                author: updatedPost?.author || { _id: '', username: '' },
                caption: updatedPost?.caption || '',
                createdAt: updatedPost?.createdAt || new Date(),
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            notification.error({
                message: 'Error',
                description: error?.message || 'Failed to like/unlike post.',
                placement: 'topRight',
            });
        }
    };

    // Xử lý like/unlike bình luận
    const handleLikeComment = async (commentId) => {
        const comment = comments.find(c => c._id === commentId);
        const isCommentLiked = comment?.likes?.some(like => (like._id || like) === userId) || false;
        try {
            if (isCommentLiked) {
                await unlikeCommentAPI(commentId, userId);
            } else {
                await likeCommentAPI(commentId, userId);
            }
            const updatedComments = await fetchCommentsByPostAPI(selectedPost._id, currentCommentPage, commentLimit);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
        } catch (error) {
            console.error('Error toggling comment like:', error);
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to like/unlike comment.',
                placement: 'topRight',
            });
        }
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId) => {
        if (isDeleting[commentId]) return;
        setIsDeleting(prev => ({ ...prev, [commentId]: true }));
        try {
            await deleteCommentAPI(commentId);
            notification.success({
                message: 'Comment Deleted',
                description: 'Your comment has been successfully deleted.',
                placement: 'topRight',
            });
            const updatedComments = await fetchCommentsByPostAPI(selectedPost._id, currentCommentPage, commentLimit);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
        } catch (error) {
            console.error('Error deleting comment:', error);
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to delete comment.',
                placement: 'topRight',
            });
        } finally {
            setIsDeleting(prev => ({ ...prev, [commentId]: false }));
        }
    };

    // Xử lý gửi bình luận
    const handleComment = async () => {
        if (commentText.trim() && selectedPost) {
            try {
                const newComment = await createCommentAPI(selectedPost._id, userId, commentText);
                if (newComment && newComment._id) {
                    setComments([]);
                    setCurrentCommentPage(1);
                    await fetchComments(selectedPost._id, 1);
                    setCommentText('');
                    setIsCommentInputVisible(false);
                    notification.success({
                        message: 'Comment Added',
                        description: 'Your comment has been successfully added.',
                        placement: 'topRight',
                    });
                }
            } catch (error) {
                console.error('Error adding comment:', error);
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to add comment.',
                    placement: 'topRight',
                });
            }
        }
    };

    // Xử lý chia sẻ
    const showShareModal = () => setIsShareModalVisible(true);
    const handleShareModalCancel = () => setIsShareModalVisible(false);

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
        dotsClass: 'slick-dots absolute bottom-2 flex justify-center w-full',
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
        if (video) video.pause();
    };

    const handleVideoPlay = (current) => {
        const video = videoRefs.current[current];
        if (video && selectedPost?.mediaFiles?.[current]?.type === 'video') {
            video.muted = isMuted;
            video.play().catch(error => console.log('Video play error:', error));
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

    const handlePrev = () => sliderRef.current?.slickPrev();
    const handleNext = () => sliderRef.current?.slickNext();

    // Menu xóa bình luận
    const commentMenu = (commentId) => (
        <Menu>
            <Menu.Item key="delete" onClick={() => handleDeleteComment(commentId)} danger disabled={isDeleting[commentId]}>
                {isDeleting[commentId] ? 'Deleting...' : 'Delete'}
            </Menu.Item>
            <Menu.Item key="cancel">Cancel</Menu.Item>
        </Menu>
    );

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-lg mx-auto bg-white min-h-screen" ref={postSectionRef}>
            {/* Explore grid */}
            <div className="grid grid-cols-3 gap-0.5">
                {posts.map((post, index) => {
                    const isPattern1 = Math.floor(index / 5) % 2 === 0;
                    const subIndex = index % 5;
                    const isVideo = post.mediaFiles?.[0]?.type === 'video';
                    const isMultiMedia = post.mediaFiles?.length > 1;

                    let gridStyle = 'relative aspect-square';
                    if (isPattern1 && subIndex === 2) {
                        gridStyle = 'relative row-span-2 aspect-[1/2]';
                    } else if (!isPattern1 && subIndex === 0) {
                        gridStyle = 'relative row-span-2 aspect-[1/2]';
                    }

                    // Tạo poster URL từ public_id của Cloudinary nếu có
                    const posterUrl = post.mediaFiles?.[0]?.public_id
                        ? `https://res.cloudinary.com/<your_cloud_name>/image/upload/${post.mediaFiles[0].public_id}.jpg`
                        : undefined;

                    return (
                        <div
                            key={post._id}
                            className={gridStyle}
                            onClick={() => openPostModal(post)}
                        >
                            {isVideo ? (
                                <video
                                    src={post.mediaFiles?.[0]?.url}
                                    poster={posterUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                />
                            ) : (
                                <img
                                    src={post.mediaFiles?.[0]?.url || 'https://via.placeholder.com/400'}
                                    alt="Content image"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            )}
                            {isVideo && (
                                <div className="absolute top-2 right-2 text-white">
                                    <Play className="w-4 h-4 fill-white" />
                                </div>
                            )}
                            {isMultiMedia && (
                                <div className="absolute bottom-2 right-2 text-white">
                                    <Grid3X3 className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Infinite Scroll Trigger cho bài viết */}
            {hasMorePosts && (
                <div
                    ref={loadMorePostsRef}
                    className="text-center mt-4 min-h-[20px]"
                >
                    {postLoading && <div>Loading more posts...</div>}
                </div>
            )}
            {!hasMorePosts && posts.length > 0 && (
                <div className="text-center mt-4 text-gray-500">
                    No more posts to load
                </div>
            )}
            {postError && (
                <div className="text-center mt-4 text-red-500">
                    {postError}
                    <Button
                        type="link"
                        onClick={() => fetchPosts(currentPostPage)}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <Modal
                    open={isPostModalOpen}
                    onCancel={handlePostModalCancel}
                    footer={null}
                    centered
                    width="80%"
                    className="p-0"
                >
                    <div className="flex h-[80vh]">
                        {/* Left: Media */}
                        {selectedPost?.mediaFiles?.length > 0 && (
                            <div className="hidden md:block w-3/5 h-full bg-black relative">
                                <Slider ref={sliderRef} {...sliderSettings}>
                                    {selectedPost.mediaFiles.map((media, index) => (
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
                                {selectedPost?.mediaFiles?.length > 1 && (
                                    <>
                                        {currentSlide !== 0 && (
                                            <button
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                                                onClick={handlePrev}
                                            >
                                                <LeftOutlined className="text-black text-sm" />
                                            </button>
                                        )}
                                        {currentSlide !== (selectedPost?.mediaFiles?.length || 0) - 1 && (
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
                        )}

                        {/* Right: Comments */}
                        <div className="w-full md:w-2/5 h-full flex flex-col">
                            {/* Post Header */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                <Avatar
                                    src={selectedPost.author?.avatar || `https://i.pravatar.cc/150?u=${selectedPost.author?._id}`}
                                    icon={<UserOutlined />}
                                    className="border-2 border-pink-500 p-0.5 rounded-full"
                                    size={32}
                                />
                                <div className="ml-3 flex flex-col">
                                    <span className="font-semibold text-black">{selectedPost.author?.username || `user${selectedPost.author?._id}`}</span>
                                    <span className="text-xs text-gray-400">{postTime}</span>
                                </div>
                            </div>

                            {/* Caption and Comments */}
                            <div
                                className="p-4 overflow-y-auto"
                                style={{ maxHeight: 'calc(80vh - 280px)' }}
                                ref={commentSectionRef}
                            >
                                {/* Caption */}
                                <div className="flex items-center mb-4">
                                    <Avatar
                                        src={selectedPost.author?.avatar || `https://i.pravatar.cc/150?u=${selectedPost.author?._id}`}
                                        icon={<UserOutlined />}
                                        size={24}
                                        className="mr-2"
                                    />
                                    <div className="flex flex-col">
                                        <div>
                                            <span className="font-semibold mr-2 text-black">{selectedPost.author?.username || `user${selectedPost.author?._id}`}</span>
                                            <span>{selectedPost.caption}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{postTime}</span>
                                    </div>
                                </div>

                                {/* Comments List */}
                                {commentLoading && sortedComments.length === 0 ? (
                                    <div className="text-center mt-4">Loading comments...</div>
                                ) : commentError ? (
                                    <div className="text-center mt-4 text-red-500">
                                        {commentError}
                                        <Button
                                            type="link"
                                            onClick={() => fetchComments(selectedPost._id, currentCommentPage)}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : sortedComments.length > 0 ? (
                                    sortedComments.map((comment, index) => {
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

                                {/* Infinite Scroll Trigger cho bình luận */}
                                {hasMoreComments && (
                                    <div
                                        ref={loadMoreCommentsRef}
                                        className="text-center mt-4 min-h-[20px]"
                                    >
                                        {commentLoading && <div>Loading more comments...</div>}
                                    </div>
                                )}
                                {!hasMoreComments && sortedComments.length > 0 && (
                                    <div className="text-center mt-4 text-gray-500">
                                        No more comments to load
                                    </div>
                                )}
                                {commentError && (
                                    <div className="text-center mt-4 text-red-500">
                                        {commentError}
                                        <Button
                                            type="link"
                                            onClick={() => fetchComments(selectedPost._id, currentCommentPage)}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}

                                {/* Comment Input khi cuộn */}
                                {isCommentInputVisible && (
                                    <div className="mt-4 p-4 bg-white border-t border-gray-200">
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
                                )}
                            </div>

                            {/* Likes and Actions */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex justify-between text-2xl mb-2">
                                    <div className="flex gap-3">
                                        {selectedPost?.likes?.some(like => like._id === userId || like === userId) ? (
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
                                    {selectedPost?.likes?.length || 0} likes
                                </div>
                            </div>

                            {/* Default Comment Input */}
                            {!isCommentInputVisible && (
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
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Share Modal */}
            {selectedPost && (
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
                                value={`${window.location.origin}/posts/${selectedPost._id}`}
                                readOnly
                                className="flex-1 mr-2 border-none bg-transparent"
                            />
                            <Button
                                type="primary"
                                onClick={() => copyToClipboard(`${window.location.origin}/posts/${selectedPost._id}`)}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ExplorePage;