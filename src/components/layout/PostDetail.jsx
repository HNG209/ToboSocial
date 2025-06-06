import React, { useState, useEffect, useRef, use } from 'react';
import { Avatar, Modal } from 'antd';
import { Heart, Send, MessageCircle, Bookmark, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Skeleton, Spin } from 'antd';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../redux/profile/profileSlice';
import { createComment, fetchMoreComments, fetchPost, fetchPostDetail, fetchRepliesComment, toggleCommentLike, toggleLike } from '../../redux/post/selectedPostSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { set } from 'lodash';
import CommentRefractor from '../refractor/CommentRefractor';

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

//get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

//get user by id in localStorage
const currentUserId = userFromStorage ? userFromStorage._id : null; // Lấy userId từ localStorage


const PostDetail = () => {
    const { postId } = useParams();

    const scrollContainerRef = useRef(null);

    const [muted, setMuted] = useState(true);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [replyToComment, setReplyToComment] = useState(null);

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
        console.log('PostDetail: postComments changed', postComments);
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
                                <div className="mb-3 mt-2 ml-2 flex flex-col" key={c._id}>
                                    <CommentRefractor
                                        comment={c}
                                        replyToComment={replyToComment}
                                        handleCommentReply={handleCommentReply}
                                        handleCancelReply={handleCancelReply}
                                    />
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
