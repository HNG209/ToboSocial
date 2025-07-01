import React, { useState, useEffect, useRef, use } from 'react';
import { Avatar, Modal } from 'antd';
import { Heart, Send, MessageCircle, Bookmark, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeartOutlined, HeartFilled, EllipsisOutlined } from '@ant-design/icons';
import { Skeleton, Spin } from 'antd';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearReplyComments, createComment, deletePost, fetchMoreComments, fetchPost, fetchPostDetail, fetchRepliesComment, toggleCommentLike, toggleLike } from '../../redux/post/post.slice';
import { useNavigate, useParams } from 'react-router-dom';
import { animate, motion } from "framer-motion";
import CommentRefractor from '../refractor/CommentRefractor';
import useGlobalNotification from '../../hooks/useGlobalNotification';

const NextArrow = ({ onClick }) => (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-white bg-black/50 p-1 rounded-full" onClick={onClick}>
        <ChevronRight size={24} />
    </div>
);

const PrevArrow = ({ onClick }) => (
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-white bg-black/50 p-1 rounded-full" onClick={onClick}>
        <ChevronLeft size={24} />
    </div>
);

const PostDetail = ({ onClose }) => {
    const { postId } = useParams();

    const scrollContainerRef = useRef(null);
    const notify = useGlobalNotification();
    const [muted, setMuted] = useState(true);
    const [zoom, setZoom] = useState(false);
    const [repliedComment, setRepliedComment] = useState(null); // dùng để animate, nhận id
    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [replyToComment, setReplyToComment] = useState(null);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const commentRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsCommentVisible(true);
                    observer.disconnect(); // dừng theo dõi sau khi đã thấy
                }
            },
            {
                threshold: 0.6, // 60% xuất hiện trong viewport mới tính là "hiện"
            }
        );

        if (commentRef.current) {
            observer.observe(commentRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [repliedComment]); // trigger lại mỗi khi bạn muốn scroll tới comment mới


    useEffect(() => {
        if (commentRef.current) {
            commentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [repliedComment]);


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authUser = useSelector((state) => state.auth.user)
    const postDetail = useSelector((state) => state.post.current)
    const postComments = useSelector((state) => state.post.comments)
    const likeStatus = useSelector((state) => state.post.current.isLiked)
    const status = useSelector((state) => state.post.status)
    const commentLoading = useSelector((state) => state.post.isLoadingMoreComments)
    const fetchMore = useSelector((state) => state.post.fetchMore) // check if there're more comments to load

    // const userData = useSelector((state) => state.profile.user); // current user's data

    const handleOptionsClick = () => setIsOptionsModalOpen(true);
    const handleOptionsClose = () => setIsOptionsModalOpen(false);

    const handleDeletePost = () => {
        Modal.confirm({
            title: 'Xác nhận xoá bài viết',
            content: 'Bạn có chắc chắn muốn xoá bài viết này không?',
            okText: 'Xoá',
            okType: 'danger',
            cancelText: 'Huỷ',
            onOk() {
                dispatch(deletePost())
                setIsOptionsModalOpen(false);
                onClose();
                notify.success('Xoá thành công!', 'Bài viết đã xoá thành công')
            },
        });
    };

    const handleReportPost = () => {
        // TODO: Thêm logic báo cáo bài viết ở đây

        setIsOptionsModalOpen(false);
    };

    const handlePostUpdate = () => {
        navigate(`/update/post/${postDetail._id}`)
        setIsOptionsModalOpen(false);
    }

    const handleViewPost = () => {
        // TODO: Thêm logic xem bài viết (có thể chuyển hướng)
        setIsOptionsModalOpen(false);
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const isAtBottom =
            container.scrollTop + container.clientHeight >= container.scrollHeight - 10; // margin nhỏ

        if (isAtBottom) {
            // Gọi API để fetch thêm bình luận
            if (!commentLoading && status === 'succeeded') {
                dispatch(fetchMoreComments())
            }
        }
    };

    useEffect(() => { // test motion
        setZoom(true);
        const timeout = setTimeout(() => {
            setZoom(false); // quay lại trạng thái ban đầu
        }, 800); // chạy trong 800ms

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (postId != null && postId != undefined) {
            dispatch(fetchPost(postId))
            dispatch(fetchPostDetail(postId))
        }
    }, [postId])

    useEffect(() => {
        setReplyToComment(null); // Reset reply state when postDetail changes
        setComments(postComments)
    }, [postComments])

    useEffect(() => {
        setIsLiked(likeStatus)
    }, [likeStatus])

    const handleCommentChange = (e) => setComment(e.target.value);

    const handleCommentPost = async () => {
        await dispatch(createComment(
            {
                post: postDetail._id,
                text: comment,
                replyTo: replyToComment !== null ? replyToComment.commentId : null,
                rootComment: replyToComment !== null ? replyToComment.rootComment : null
            }))
        setComment('')
    };

    const togglePostLike = () => {
        dispatch(toggleLike(postDetail._id))
    }

    const toggleMute = () => setMuted(!muted);

    const handleCommentReply = (comment) => {
        setReplyToComment(comment);
    }

    const handleViewMoreReplies = (commentId) => {
        dispatch(fetchRepliesComment(commentId));
    };

    const handleShowLessReplies = (commentId) => {
        dispatch(clearReplyComments(commentId));
    }

    const handleCancelReply = () => {
        setReplyToComment(null);
    };

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
    };

    const renderMedia = (media, index) => (
        <div
            key={index}
            className="h-[70vh] w-full flex items-center justify-center bg-black"
        >
            {media.type === 'image' ? (
                <div className="flex items-center justify-center w-full h-full">
                    <img
                        src={media.url}
                        alt="Post media"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                    <video
                        src={media.url}
                        className="max-h-full max-w-full object-contain"
                        controls
                        muted={muted}
                        autoPlay
                        loop
                    />
                    <button
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
                        onClick={toggleMute}
                    >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white flex flex-col lg:flex-row rounded-lg overflow-hidden w-full max-h-[90vh]">
            {/* Media */}
            <div className="w-full lg:w-3/5 bg-black relative flex items-center justify-center h-[70vh]">
                <div className="h-full w-full">
                    <Slider {...sliderSettings}>
                        {Array.isArray(postDetail.mediaFiles) && postDetail.mediaFiles.map((media, index) => renderMedia(media, index))}
                    </Slider>
                </div>
            </div>


            {/* Right (desktop) or Bottom (mobile) */}
            <div className="w-full lg:w-2/5 flex flex-col p-4 text-sm max-h-[50vh] lg:max-h-full overflow-y-auto">
                {/* User Info */}
                <div className="flex items-center justify-between space-x-2 mb-3 border-b pb-2">
                    <div>
                        <Avatar size={30} className="absolute top-0 left-0 z-10 m-4" src={postDetail?.author?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                            <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                        </Avatar>
                        <span className="ml-2 font-semibold">{'@' + postDetail?.author?.username}</span>
                        {/* <span className='ml-2'>{`- ${userData?.fullName}`}</span> */}
                        <span className="ml-1">{postDetail.caption}</span>
                    </div>
                    <EllipsisOutlined
                        onClick={handleOptionsClick}
                        className="ml-2 hover:text-blue-500 hover:cursor-pointer text-lg" />
                </div>
                <Modal
                    open={isOptionsModalOpen}
                    onCancel={handleOptionsClose}
                    footer={null}
                    closable={false} // Ẩn nút đóng mặc định
                    centered
                >
                    <div className="flex flex-col space-y-3">
                        {
                            // block quyền xoá bài viết nếu không phải người đăng nhập trên front-end (đã chặn trong back-end)
                            authUser._id === postDetail.author?._id && // comment để test cho back-end
                            <button
                                className="text-red-500 shadow-sm font-semibold py-2 hover:bg-gray-100 rounded"
                                onClick={handleDeletePost}
                            >
                                Xoá bài viết
                            </button>
                        }
                        {
                            authUser._id === postDetail.author?._id && // chỉ cho phép chủ bài viết chỉnh sửa
                            <button
                                className="text-gray-500 shadow-sm font-semibold py-2 hover:bg-gray-100 rounded"
                                onClick={handlePostUpdate}
                            >
                                Chỉnh sửa bài viết
                            </button>
                        }
                        <button
                            className="text-gray-500 shadow-sm font-semibold py-2 hover:bg-gray-100 rounded"
                            onClick={handleReportPost}
                        >
                            Báo cáo
                        </button>
                        <button
                            className="text-gray-500 shadow-sm font-semibold py-2 hover:bg-gray-100 rounded"
                            onClick={handleViewPost}
                        >
                            Xem bài viết
                        </button>
                        <button
                            className="py-2 shadow-sm hover:bg-gray-100 rounded"
                            onClick={handleOptionsClose}
                        >
                            Đóng
                        </button>
                    </div>
                </Modal>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="space-y-2 mb-4 h-100 sm:max-h-80 md:max-h-96 overflow-y-auto">

                    {
                        status === 'loading' && comments.length === 0 ? <Skeleton active className='mt-2 ml-2' /> :
                            comments.map((c) => (
                                <div className="flex flex-col" key={c._id}>
                                    <motion.div
                                        key={repliedComment === c._id ? `${c._id}-zoom` : c._id} // ép remount
                                        animate={repliedComment === c._id && isCommentVisible ? { scale: [1, 1.05, 1] } : false}
                                        transition={{
                                            duration: 0.6,
                                            ease: "easeInOut",
                                        }}
                                        onAnimationComplete={() => {
                                            setRepliedComment(null);
                                        }}
                                    >
                                        <CommentRefractor
                                            ref={repliedComment === c._id ? commentRef : null}
                                            comment={c}
                                            replyToComment={replyToComment}
                                            handleCommentReply={handleCommentReply}
                                            handleCancelReply={handleCancelReply}
                                            onClose={onClose}
                                        />
                                    </motion.div>
                                    {
                                        c.replies && c.replies.length > 0 &&
                                        c.replies.map((reply) => (
                                            <div className="ml-5" key={reply._id}>
                                                <motion.div
                                                    key={repliedComment === reply._id ? `${reply._id}-zoom` : reply._id} // ép remount
                                                    animate={repliedComment === reply._id && isCommentVisible ? { scale: [1, 1.07, 1] } : false}
                                                    transition={{
                                                        duration: 0.8,
                                                        ease: "easeInOut",
                                                    }}
                                                    onAnimationComplete={() => {
                                                        setRepliedComment(null);
                                                    }}
                                                >
                                                    <CommentRefractor
                                                        ref={repliedComment === reply._id ? commentRef : null}
                                                        comment={reply}
                                                        replyToComment={replyToComment}
                                                        handleCommentReply={handleCommentReply}
                                                        handleCancelReply={handleCancelReply}
                                                        onClose={onClose}
                                                        setReplied={setRepliedComment}
                                                    />
                                                </motion.div>
                                            </div>
                                        ))
                                    }
                                    {
                                        c.replies && c.replies.length > 0 && c.replyPage !== -1 &&
                                        <div className='text-xs text-gray-500 mt-2 text-center cursor-pointer hover:text-blue-500'
                                            onClick={() => handleViewMoreReplies(c._id)}>
                                            view more replies...
                                        </div>
                                    }
                                    {
                                        c.replyPage === -1 &&
                                        <div
                                            onClick={() => handleShowLessReplies(c._id)}
                                            className='text-xs text-gray-500 mt-2 text-center cursor-pointer hover:text-blue-500'>
                                            show less
                                        </div>
                                    }
                                </div>
                            ))

                    }
                </div>



                {/* Actions */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="flex space-x-4">
                            {
                                isLiked ?
                                    <HeartFilled onClick={togglePostLike} size={30} className="cursor-pointer text-2xl" /> :
                                    <HeartOutlined onClick={togglePostLike} size={30} className="cursor-pointer text-2xl" />
                            }
                            {/* <Heart className="cursor-pointer" /> */}
                            <MessageCircle className="cursor-pointer" />
                            <Send className="cursor-pointer" />
                            {status === 'loading' && fetchMore && (
                                <div className='flex items-center justify-center'>
                                    <Spin />
                                </div>
                            )}
                        </div>
                        <Bookmark className="cursor-pointer" />
                    </div>
                    <div className="text-sm font-semibold">{postDetail?.likeCount || 0} likes</div>

                    {/* Comment input */}
                    <div className="flex items-center border-t pt-2">
                        <input
                            type="text"
                            value={comment}
                            onChange={handleCommentChange}
                            placeholder={
                                replyToComment ?
                                    "reply to " + (replyToComment?.username ? `@${replyToComment?.username}` : '') :
                                    "Add a comment..."
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && comment.trim()) {
                                    handleCommentPost();
                                    setReplyToComment(null); // Reset reply after posting
                                }
                            }}
                            className="flex-1 outline-none"
                        />
                        <button
                            className={`text-blue-500 font-semibold ml-2 ${!comment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleCommentPost}
                            disabled={!comment.trim()}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
