// src/components/home/postCard.js
import { Card, Avatar, Modal, Button } from 'antd';
import { BarsOutlined, HeartOutlined, MessageOutlined, SendOutlined, UserOutlined, LeftOutlined, RightOutlined, SoundOutlined, AudioMutedOutlined, HeartFilled } from '@ant-design/icons';
import { FiBookmark } from 'react-icons/fi';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../styles/home.css';

// Hàm tính thời gian đăng bài
const timeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
};

function PostCard({ post, userId, onLikeToggle }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const sliderRef = useRef(null);
    const cardRef = useRef(null);
    const videoRefs = useRef([]);

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

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
            handleVideoPause(current);
            setCurrentSlide(next);
        },
        afterChange: (current) => handleVideoPlay(current),
    };

    const handleVideoPause = (current) => {
        const video = videoRefs.current[current];
        if (video) video.pause();
    };

    const handleVideoPlay = (current) => {
        const video = videoRefs.current[current];
        if (video && post.mediaFiles[current].type === 'video') {
            video.play();
            setIsMuted(false);
            video.muted = false;
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

    const handleLikeClick = () => {
        onLikeToggle(post._id, isLiked); // Gọi callback từ Home
    };

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
            const currentVideo = videoRefs.current[currentSlide];
            if (currentVideo && post.mediaFiles[currentSlide].type === 'video') {
                currentVideo.muted = false;
                setIsMuted(false);
                currentVideo.play();
            }
        }
    }, [currentSlide, post.mediaFiles]);

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
    }, [post]);

    const isLiked = post.likes.some(like => like._id === userId);


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
                        <span className="font-semibold text-black">{post.author?.username || `user${post.author?._id}`}</span>
                        <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                    </div>
                </div>
                <BarsOutlined className="text-lg text-black" onClick={showModal} />
            </div>

            {/* Modal Actions */}
            <Modal
                closable={false}
                centered={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <Button danger size="medium" className="w-full mb-2" onClick={handleOk}>Báo cáo</Button>
                <Button size="medium" className="w-full mb-2" onClick={handleOk}>Sao chép liên kết</Button>
                <Button size="medium" className="w-full" onClick={handleOk}>Đi đến bài viết</Button>
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

                {post.mediaFiles.length > 1 && (
                    <>
                        {currentSlide !== 0 && (
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                onClick={handlePrev}
                            >
                                <LeftOutlined className="text-black text-sm" />
                            </button>
                        )}
                        {currentSlide !== post.mediaFiles.length - 1 && (
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                onClick={handleNext}
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
                    <MessageOutlined className="text-black hover:text-gray-400" />
                    <SendOutlined className="text-black hover:text-gray-400" />
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

            {/* Comments Count */}
            {post.comments.length > 0 && (
                <div className="px-3 text-sm text-gray-400">
                    View all {post.comments.length} comments
                </div>
            )}
        </div>
    );
}

export default PostCard;