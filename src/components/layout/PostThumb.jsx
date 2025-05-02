import {
    HeartOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import PostDetail from './PostDetail';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComments, fetchPosts } from '../../redux/post/postsSlice';
import { fetchPostComments } from '../../redux/comments/commentsSlice';
import { fetchPostCommentsAPI } from '../../services/api.service';

export default function PostThumb({ post }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();

    const samplePost = {
        user: 'hung_user',
        media: [
            {
                type: 'image',
                src: 'https://picsum.photos/id/1015/800/600',
            },
            {
                type: 'video',
                src: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
            },
        ],
        likes: ['alice', 'bob'],
        comments: [
            { user: 'alice', text: 'Great picture!' },
            { user: 'bob', text: 'Amazing vibes' },
            { user: 'Hung29', text: 'Godly' }
        ],
    };


    return (
        <>
            <div className="relative rounded-lg overflow-hidden group shadow-md aspect-square w-full">
                {/* Image */}
                <img
                    src={post.mediaFiles[0].url || "https://via.placeholder.com/300"}
                    alt="post"
                    className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div
                    onClick={() => {
                        dispatch(fetchPostComments(post._id))
                        setIsModalOpen(true)
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                    <p className="text-white text-lg font-semibold">View post</p>
                    <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                            <HeartOutlined />
                            <span>{post?.likes.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageOutlined />
                            <span>{post?.comments.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <PostDetail
                post={post}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
