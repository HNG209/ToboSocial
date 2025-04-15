import { useEffect, useState } from 'react';
import PostCard from '../components/home/postCard';
import { getAllPosts } from '../services/api.service';
import Stories from '../components/home/stories';

function Home() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getAllPosts();
                setPosts(data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="flex justify-center bg-white">
            <div className="w-full max-w-[630px] border-x border-gray-200 min-h-screen">
                {/* Story Section */}
                <Stories />

                {/* Post Feed */}
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
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
