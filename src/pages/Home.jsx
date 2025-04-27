// src/pages/Home.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../components/home/postCard';
import Stories from '../components/home/stories';
import { fetchPosts, likePost, unlikePost } from '../redux/post/postsSlice';

function Home() {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.posts.posts);
    const status = useSelector((state) => state.posts.status);
    const userId = "662b00000000000000000005";

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchPosts());
        }
    }, [dispatch, status]);

    const handleLikeToggle = (postId, isLiked) => {
        if (isLiked) {
            dispatch(unlikePost({ postId, userId }));
        } else {
            dispatch(likePost({ postId, userId }));
        }
    };

    return (
        <div className="flex justify-center bg-white">
            <div className="w-full max-w-[630px] border-x border-gray-200 min-h-screen">
                {/* Story Section */}
                <Stories />

                {/* Post Feed */}
                {status === 'loading' && <p>Loading posts...</p>}
                {status === 'succeeded' &&
                    posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            userId={userId}
                            onLikeToggle={handleLikeToggle}
                        />
                    ))}
                {status === 'failed' && <p>Error loading posts</p>}
            </div>

            {/* Right Sidebar - Gợi ý follow */}
            <div className="hidden lg:block w-[320px] px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <img className="w-12 h-12 rounded-full" src="https://i.pravatar.cc/150?img=12" alt="profile" />
                        <div className="ml-3">
                            <div className="font-semibold">ph_g</div>
                            <div className="text-gray-500 text-sm">Huỳnh Phương</div>
                        </div>
                    </div>
                    <button className="text-blue-500 font-semibold">Switch</button>
                </div>
                <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-500 font-semibold">Suggested for you</span>
                    <button className="text-xs font-semibold">See All</button>
                </div>
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="suggested user" />
                            <div className="ml-2 text-sm">
                                <div className="font-semibold">user_suggest_{i + 1}</div>
                                <div className="text-gray-500 text-xs">Suggested for you</div>
                            </div>
                        </div>
                        <button className="text-xs text-blue-500 font-semibold">Follow</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;