import React, { useState, useEffect } from 'react';
import { Avatar, Modal } from 'antd';
import { Heart, Send, MessageCircle, Bookmark, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments } from '../../redux/post/postsSlice';

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

const PostDetail = ({ post, open, onClose }) => {
    const [muted, setMuted] = useState(true);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);

    const dispatch = useDispatch();
    const userData = useSelector((state) => state.profile.user); // current user's data
    const status = useSelector((state) => state.profile.status);

    const postComments = useSelector((state) => state.comments.comments)

    console.log('cmt ne', postComments)

    useEffect(() => {
        if (status === 'idle') {
            dispatch(getCurrentUser({}));
            dispatch(fetchPostByUser({ page: 1, limit: 10 }));
        }
    }, [dispatch, status]);

    useEffect(() => {
        if (post) {
            setComments(post.comments || []);
        }
    }, [post]);

    const handleCommentChange = (e) => setComment(e.target.value);
    const handleCommentPost = () => {
        if (comment.trim()) {
            setComments([...comments, { user: 'you', text: comment }]);
            setComment('');
        }
    };
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
                    src={media.src}
                    alt="Post media"
                    className="max-h-full max-w-full object-contain"
                />
            ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                    <video
                        src={media.src}
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



    if (!post) return null;

    return (
        <Modal open={open} onCancel={onClose} footer={null} width="90vw" style={{ maxWidth: 1200 }} centered>
            <div className="bg-white flex flex-col lg:flex-row rounded-lg overflow-hidden w-full max-h-[90vh]">
                {/* Media */}
                <div className="w-full lg:w-3/5 bg-black relative flex items-center justify-center h-[70vh]">
                    <div className="h-full w-full">
                        <Slider {...sliderSettings}>
                            {Array.isArray(post.mediaFiles) && post.mediaFiles.map((media, index) => renderMedia(media, index))}
                        </Slider>
                    </div>
                </div>


                {/* Right (desktop) or Bottom (mobile) */}
                <div className="w-full lg:w-2/5 flex flex-col p-4 text-sm max-h-[50vh] lg:max-h-full overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center space-x-2 font-semibold mb-3">
                        <Avatar size={30} className="absolute top-0 left-0 z-10 m-4" src={userData?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                            <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                        </Avatar>
                        <span className='ml-2'>{userData.fullName}</span>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2 mb-4 h-100 sm:max-h-80 md:max-h-96 overflow-y-auto">
                        <hr />
                        <Avatar size={30} className="absolute top-0 left-0 z-10 m-4" src={userData?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                            <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                        </Avatar>
                        <span className='ml-2 font-semibold'>{'@' + userData?.username}</span>
                        <span className='ml-1'>{post.caption}</span>
                        {postComments.map((c) => (
                            console.log(c),
                            <div className='mb-2 mt-2 ml-2'>
                                <Avatar size={30} className="absolute top-0 left-0 z-10 m-4" src={c?.user?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                                    <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                                </Avatar>
                                <span className='ml-2 font-semibold'>{'@' + c?.user?.username}</span>
                                <span className='ml-1'>{c?.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-gray-600">
                            <div className="flex space-x-4">
                                <Heart className="cursor-pointer" />
                                <MessageCircle className="cursor-pointer" />
                                <Send className="cursor-pointer" />
                            </div>
                            <Bookmark className="cursor-pointer" />
                        </div>
                        <div className="text-sm font-semibold">{post.likes?.length || 0} likes</div>

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
        </Modal>
    );
};

export default PostDetail;
