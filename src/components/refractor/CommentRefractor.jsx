import { HeartFilled, HeartOutlined } from "@ant-design/icons"
import { Avatar } from "antd"
import { fetchRepliesComment, toggleCommentLike } from "../../redux/post/selectedPostSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { use, useEffect, useState } from "react";

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

function CommentRefractor({ comment, handleCommentReply, handleCancelReply, replyToComment }) {
    console.log('CommentRefractor render', comment._id);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const comments = useSelector((state => state.selectedPost.comments));
    const [replies, setReplies] = useState([]);

    const isLiked = comments.find(c => c._id === comment._id)?.isLiked;

    const toggleCmtLike = (commentId) => {
        dispatch(toggleCommentLike(commentId))
    }

    const handleReplyView = (commentId) => {
        dispatch(fetchRepliesComment(commentId));
    }

    useEffect(() => {
        // Lấy các bình luận trả lời từ Redux store
        const commentReplies = comments.find(c => c._id === comment._id)?.replies || [];
        setReplies(commentReplies);
    }, [comments, dispatch]);

    const viewProfile = (userId) => {
        if (typeof onClose === 'function') {
            onClose();
        }

        if (userId === currentUserId) return;

        navigate(`/profile/other/${userId}`)
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <Avatar
                        size={30}
                        className="absolute top-0 left-0 z-10 m-4 cursor-pointer"
                        src={comment?.user?.profile?.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}
                    >
                        <img
                            src="https://i.pravatar.cc/150?u=user"
                            alt="user"
                            className="w-full object-cover max-h-[600px]"
                        />
                    </Avatar>
                    <span onClick={() => { viewProfile(comment?.user?._id) }} className="ml-2 font-semibold cursor-pointer hover:text-purple-800">{'@' + comment?.user?.username}</span>
                    <span className="ml-1">{comment?.text}</span>
                </div>
                {isLiked ? (
                    <HeartFilled
                        onClick={() => toggleCmtLike(comment._id)}
                        size={30}
                        className="cursor-pointer text-lg mr-3"
                    />
                ) : (
                    <HeartOutlined
                        onClick={() => toggleCmtLike(comment._id)}
                        size={30}
                        className="cursor-pointer text-lg mr-3"
                    />
                )}
            </div>
            {/* Formatted comment time in English */}
            <span className="text-xs text-gray-500 ml-10">
                {formatCommentTime(comment.createdAt)}
                {
                    comment?.countReply > 0 &&
                    <span onClick={() => {
                        handleReplyView(comment._id);
                    }} className="text-xs text-gray-500 ml-2 cursor-pointer hover:text-blue-500">
                        {comment.countReply} repl{comment.countReply > 1 ? 'ies' : 'y'}
                    </span>
                }
                {
                    replyToComment && replyToComment.commentId === comment._id ?
                        <span onClick={handleCancelReply} className="text-xs text-red-500 ml-2 cursor-pointer hover:text-red-700">
                            cancel
                        </span> :
                        <span onClick={() => {
                            handleCommentReply({
                                commentId: comment._id,
                                username: comment.user.username,
                                rootComment: comment._id
                            })
                        }} className="text-xs text-gray-500 ml-2 cursor-pointer hover:text-blue-500">
                            reply
                        </span>
                }
            </span>
            {
                replies.length > 0 && replies.map(reply => (
                    <div className="ml-5 mt-2" key={reply._id}>
                        <CommentRefractor
                            comment={reply}
                            handleCommentReply={handleCommentReply}
                            handleCancelReply={handleCancelReply}
                            replyToComment={replyToComment}
                        />
                    </div>
                ))
            }

        </div>
    )
}

export default React.memo(CommentRefractor, (prevProps, nextProps) => {
    // Chỉ render lại nếu comment khác nhau
    return prevProps.comment._id === nextProps.comment._id &&
        prevProps.replyToComment?.commentId === nextProps.replyToComment?.commentId;
});