import { HeartFilled, HeartOutlined } from "@ant-design/icons"
import { Avatar } from "antd"
import { fetchRepliesComment } from "../../redux/post/selectedPostSlice";

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

export default function Comment({ comment, handleCommentReply, handleCancelReply }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleCmtLike = (commentId) => {
        dispatch(toggleCommentLike(commentId))
    }

    const handleCancelReply = () => {
        setReplyToComment(null);
    };

    const viewProfile = (userId) => {
        if (typeof onClose === 'function') {
            onClose();
        }

        if (userId === currentUserId) return;

        navigate(`/profile/other/${userId}`)
    }

    return (
        <div className="mb-5 mt-2 ml-2 flex flex-col">
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
                    <span onClick={() => { viewProfile(comment?.user?._id) }} className="ml-2 font-semibold cursor-pointer hover:text-purple-800">{'@' + c?.user?.username}</span>
                    <span className="ml-1">{comment?.text}</span>
                </div>
                {comment?.isLiked ? (
                    <HeartFilled
                        onClick={() => toggleCmtLike(comment._id)}
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
                {
                    comment?.countReply > 0 &&
                    <span onClick={() => {
                        dispatch(fetchRepliesComment(c._id))
                    }} className="text-xs text-gray-500 ml-2 cursor-pointer hover:text-blue-500">
                        {comment.countReply} repl{comment.countReply > 1 ? 'ies' : 'y'}
                    </span>
                }
                {
                    replyToComment && replyToComment.commentId === c._id ?
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
        </div>
    )
}