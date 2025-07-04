import { EllipsisOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons"
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
    const [option, setOption] = useState(false);
    // console.log('CommentRefractor render', comment);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleCmtLike = (commentId) => {
        dispatch(toggleCommentLike(commentId))
    }

    const handleReplyView = (commentId) => {
        dispatch(fetchRepliesComment(commentId));
    }

    const viewProfile = (userId) => {
        if (typeof onClose === 'function') {
            onClose();
        }

        if (userId === currentUserId) return;

        navigate(`/profile/other/${userId}`)
    }

    return (
        <div
            onMouseEnter={() => {
                setOption(true);
            }}
            onMouseLeave={() => {
                setOption(false);
            }}
            className="hover:bg-gray-100 rounded-lg relative p-2 shadow-sm mb-2 transition-all duration-200 ease-in-out">
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
                <div className="flex flex-col justify-between items-center mr-2 h-full">
                    {comment.isLiked ? (
                        <HeartFilled
                            onClick={() => toggleCmtLike(comment._id)}
                            size={30}
                            className="cursor-pointer text-lg"
                        />
                    ) : (
                        <HeartOutlined
                            onClick={() => toggleCmtLike(comment._id)}
                            size={30}
                            className="cursor-pointer text-lg"
                        />
                    )}
                    <p className="text-xs text-gray-500 w-10 text-center">{comment?.likeCount || 0}</p>
                </div>

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
                                // nếu trả lời bình luận gốc thì rootComment là id của bình luận gốc, nếu trả lời bình luận con thì rootComment là root của bình luận con
                                rootComment: comment.rootComment === null ? comment._id : comment.rootComment
                            })
                        }} className="text-xs text-gray-500 ml-2 cursor-pointer hover:text-blue-500">
                            reply
                        </span>
                }
                {
                    option &&
                    <EllipsisOutlined className="ml-2 hover:text-blue-500 hover:cursor-pointer" />
                }
            </span>
        </div>
    )
}

export default React.memo(CommentRefractor, (prevProps, nextProps) => {
    // Chỉ render lại nếu comment khác nhau
    return prevProps.comment._id === nextProps.comment._id &&
        prevProps.comment?.likeCount === nextProps.comment?.likeCount &&
        prevProps.comment.countReply === nextProps.comment.countReply &&
        prevProps.comment.isLiked === nextProps.comment.isLiked &&
        prevProps.replyToComment?.commentId === nextProps.replyToComment?.commentId;
});