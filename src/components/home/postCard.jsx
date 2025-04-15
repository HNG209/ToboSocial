import { Card, Avatar } from 'antd';
import { HeartOutlined, MessageOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { FiBookmark } from 'react-icons/fi';

function PostCard({ post }) {
    return (
        <div className="border-b border-gray-200 pb-4">
            {/* Header */}
            <div className="flex items-center px-4 py-3">
                <Avatar
                    src={post.avatar || `https://i.pravatar.cc/150?u=${post.userId}`}
                    icon={<UserOutlined />}
                />
                <div className="ml-3 font-semibold">{post.username || `user${post.userId}`}</div>
            </div>

            {/* Post Image */}
            <Card
                cover={
                    <img
                        src={post.image}
                        alt="post"
                        className="w-full object-cover max-h-[600px]"
                    />
                }
                bodyStyle={{ padding: '0px' }}
                bordered={false}
            >
                {/* Action Icons */}
                <div className="flex justify-between px-4 pt-3 text-xl">
                    <div className="flex gap-4">
                        <HeartOutlined />
                        <MessageOutlined />
                        <SendOutlined />
                    </div>
                    <FiBookmark />
                </div>

                {/* Caption */}
                <div className="px-4 pt-2 pb-4 text-sm">
                    <span className="font-semibold mr-2">{post.username || `user${post.userId}`}</span>
                    {post.caption}
                </div>
            </Card>
        </div>
    );
}

export default PostCard;
