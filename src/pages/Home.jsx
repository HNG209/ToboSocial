import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { notification, Button } from 'antd';
import PostCard from '../components/home/postCard';
import { fetchPosts, likePost, unlikePost, createComment, resetPosts } from '../redux/post/postsSlice';

function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const posts = useSelector((state) => state.posts.posts);
    const status = useSelector((state) => state.posts.status);
    const currentPage = useSelector((state) => state.posts.currentPage);
    const hasMore = useSelector((state) => state.posts.hasMore);
    const userId = useSelector((state) => state.auth.user?._id);

    const observer = useRef();

    // Callback for Intersection Observer
    const lastPostElementRef = useCallback(
        (node) => {
            if (status === 'loading') return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    dispatch(fetchPosts({ page: currentPage + 1 }));
                }
            });

            if (node) observer.current.observe(node);
        },
        [status, hasMore, currentPage, dispatch]
    );

    useEffect(() => {
        // Reset posts and fetch initial page
        dispatch(resetPosts());
        dispatch(fetchPosts({ page: 1 }));
    }, [dispatch]);

    const showLoginNotification = () => {
        notification.warning({
            message: 'Authentication Required',
            description: 'Please log in to interact with posts, or continue viewing without interaction.',
            placement: 'topRight',
            duration: 0, // Keep notification open until user interacts
            btn: (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        onClick={() => {
                            notification.destroy();
                            navigate('/login');
                        }}
                    >
                        Log In
                    </Button>
                    <Button
                        onClick={() => notification.destroy()}
                    >
                        Continue Viewing
                    </Button>
                </div>
            ),
        });
    };

    const handleLikeToggle = (postId, isLiked) => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        if (isLiked) {
            dispatch(unlikePost({ postId, userId }));
        } else {
            dispatch(likePost({ postId, userId }));
        }
    };

    const handleComment = (postId, text) => {
        if (!userId) {
            showLoginNotification();
            return;
        }
        dispatch(createComment({ postId, userId, text }));
    };

    return (
        <div className="flex justify-center bg-white">
            <div className="w-full max-w-[630px] border-x border-gray-200 min-h-screen">
                {status === 'loading' && posts.length === 0 && <p className="loading">Loading posts...</p>}
                {posts.length > 0 &&
                    posts.map((post, index) => {
                        // Attach ref to the last post for Intersection Observer
                        if (index === posts.length - 1) {
                            return (
                                <div ref={lastPostElementRef} key={post._id}>
                                    <PostCard
                                        post={post}
                                        userId={userId}
                                        onLikeToggle={handleLikeToggle}
                                        onComment={handleComment}
                                    />
                                </div>
                            );
                        }
                        return (
                            <PostCard
                                key={post._id}
                                post={post}
                                userId={userId}
                                onLikeToggle={handleLikeToggle}
                                onComment={handleComment}
                            />
                        );
                    })}
                {status === 'loading' && posts.length > 0 && <p className="loading">Loading more posts...</p>}
                {status === 'failed' && <p className="error">Error loading posts</p>}
                {!hasMore && posts.length > 0 && <p className="loading">No more posts to load</p>}
            </div>
        </div>
    );
}

export default Home;