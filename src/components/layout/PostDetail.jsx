import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Modal } from 'antd';
import { Heart, Send, MessageCircle, Bookmark, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Skeleton, Spin } from 'antd';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../redux/profile/profileSlice';
import { createComment, fetchMoreComments, fetchPost, fetchPostDetail, toggleCommentLike, toggleLike } from '../../redux/post/selectedPostSlice';
import { useNavigate, useParams } from 'react-router-dom';

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

const formatCommentTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffDay < 30) {
        if (diffDay >= 1) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        if (diffHr >= 1) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
        if (diffMin >= 1) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    return created.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });
};

//get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

//get user by id in localStorage
const currentUserId = userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage


const PostDetail = ({ onClose }) => {
    const { postId } = useParams();

    const scrollContainerRef = useRef(null);

    const [muted, setMuted] = useState(true);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(false)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const postDetail = useSelector((state) => state.selectedPost.post)
    const postComments = useSelector((state) => state.selectedPost.comments)
    const likeStatus = useSelector((state) => state.selectedPost.post.isLiked)
    const status = useSelector((state) => state.selectedPost.status)
    const commentLoading = useSelector((state) => state.selectedPost.isLoadingMoreComments)
    const fetchMore = useSelector((state) => state.selectedPost.fetchMore) // check if there're more comments to load

    const userData = useSelector((state) => state.profile.user); // current user's data

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

    useEffect(() => {
        if (postId != null && postId != undefined) {
            dispatch(fetchPost(postId))
            dispatch(fetchPostDetail(postId))
        }
    }, [postId])

    useEffect(() => {
        setComments(postComments)
    }, [postComments])

    useEffect(() => {
        setIsLiked(likeStatus)
    }, [likeStatus])

    const handleCommentChange = (e) => setComment(e.target.value);

    const handleCommentPost = async () => {
        await dispatch(createComment(
            {
                postId: postDetail._id,
                text: comment
            }))
        setComment('')
    };

    const togglePostLike = () => {
        dispatch(toggleLike(postDetail._id))
    }

    const toggleCmtLike = (commentId) => {
        dispatch(toggleCommentLike(commentId))
    }

    const viewProfile = (userId) => {
        if (typeof onClose === 'function') {
            onClose();
        }

        if (userId === currentUserId) return;

        navigate(`/profile/other/${userId}`)
    }

    const toggleMute = () => setMuted(!muted);

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
                <img
                    src={media.url}
                    alt="Post media"
                    className="max-h-full max-w-full object-contain"
                />
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
                <div className="flex items-center space-x-2 font-semibold mb-3 border-b pb-2">
                    <Avatar size={30} className="absolute top-0 left-0 z-10 m-4" src={userData?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                        <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                    </Avatar>
                    <span className='ml-2'>{userData?.fullName}</span>
                </div>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="space-y-2 mb-4 h-100 sm:max-h-80 md:max-h-96 overflow-y-auto">
                    <Avatar
                        size={30}
                        className="absolute top-0 left-0 z-10 m-4"
                        src={userData?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}
                    >
                        <img
                            src="https://i.pravatar.cc/150?u=user"
                            alt="user"
                            className="w-full object-cover max-h-[600px]"
                        />
                    </Avatar>
                    <span className="ml-2 font-semibold">{'@' + userData?.username}</span>
                    <span className="ml-1">{postDetail.caption}</span>

                    {
                        status === 'loading' && comments.length === 0 ? <Skeleton active className='mt-2 ml-2' /> :
                            comments.map((c) => (
                                <div key={c._id} className="mb-5 mt-2 ml-2 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Avatar
                                                size={30}
                                                className="absolute top-0 left-0 z-10 m-4 cursor-pointer"
                                                src={c?.user?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}
                                            >
                                                <img
                                                    src="https://i.pravatar.cc/150?u=user"
                                                    alt="user"
                                                    className="w-full object-cover max-h-[600px]"
                                                />
                                            </Avatar>
                                            <span onClick={() => { viewProfile(c?.user?._id) }} className="ml-2 font-semibold cursor-pointer hover:text-purple-800">{'@' + c?.user?.username}</span>
                                            <span className="ml-1">{c?.text}</span>
                                        </div>
                                        {c?.isLiked ? (
                                            <HeartFilled
                                                onClick={() => toggleCmtLike(c._id)}
                                                size={30}
                                                className="cursor-pointer text-lg mr-3"
                                            />
                                        ) : (
                                            <HeartOutlined
                                                onClick={() => toggleCmtLike(c._id)}
                                                size={30}
                                                className="cursor-pointer text-lg mr-3"
                                            />
                                        )}
                                    </div>
                                    {/* Formatted comment time in English */}
                                    <span className="text-xs text-gray-500 ml-10">
                                        {formatCommentTime(c.createdAt)}
                                    </span>
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
                            placeholder="Add a comment..."
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
