import {
    HeartOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import PostDetail from './PostDetail';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPostDetail, fetchPost } from '../../redux/post/post.slice';
import { Modal } from 'antd';

export default function PostThumb({ post }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();

    return (
        <>
            <div className="relative rounded-lg overflow-hidden group shadow-md aspect-square w-full">
                {/* Image */}
                <img
                    src={post?.mediaFiles[0]?.url || "https://via.placeholder.com/300"}
                    alt="post"
                    className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div
                    onClick={() => {
                        dispatch(fetchPost(post._id))
                        dispatch(fetchPostDetail(post._id))
                        setIsModalOpen(true)
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                    <p className="text-white text-lg font-semibold">View post</p>
                    <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                            <HeartOutlined />
                            <span>{post?.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageOutlined />
                            <span>{post?.comments.length}</span>
                        </div>
                    </div>
                </div>
            </div>


            <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width="90vw" style={{ maxWidth: 1200 }} centered>
                <PostDetail
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>

        </>
    );
}
