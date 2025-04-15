import { Card, Avatar } from 'antd';
import { BarsOutlined, HeartOutlined, MessageOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { FiBookmark } from 'react-icons/fi';
import { Button, Modal } from 'antd';
import React, { useState } from 'react';


function PostCard({ post }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="border-b border-gray-200 pb-4">
            {/* Header */}
            <div className="flex items-center px-4 py-2 justify-between text-sm font-semibold">
                <div className='flex items-center'>
                    <Avatar
                        src={post.avatar || `https://i.pravatar.cc/150?u=${post.userId}`}
                        icon={<UserOutlined />}
                    />
                    <div className="ml-2 font-semibold">{post.username || `user${post.userId}`}</div>
                </div>
                <BarsOutlined className='text-lg hover:text-2xl' onClick={showModal} />
            </div>
            <Modal 
                closable={false} 
                centered={true} 
                open={isModalOpen} 
                onOk={handleOk} 
                onCancel={handleCancel} 
                okButtonProps={{ style: { display: 'none' } }} 
                cancelButtonProps={{ style: { display: 'none' } }}>

                <Button danger size={'medium'} className='w-full mb-2' onClick={handleOk}>
                    Báo cáo
                </Button>
                <Button size={'medium'} className='w-full mb-2' onClick={handleOk}>
                    Sao chép liên kết
                </Button>
                <Button size={'medium'} className='w-full' onClick={handleOk}>
                    Đi đến bài viết
                </Button>

            </Modal>
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
