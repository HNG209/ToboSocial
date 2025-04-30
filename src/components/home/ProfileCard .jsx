import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../../redux/auth/authSlice';

const ProfileCard = ({ user, onFollowChange }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);

    const [isFollowing, setIsFollowing] = useState(false);
    const [localUser, setLocalUser] = useState(user);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalUser(user);
        if (currentUser && user?._id) {
            const following = currentUser.following?.includes(user._id);
            setIsFollowing(following);
        }
    }, [currentUser, user]);

    const handleFollowClick = async () => {
        if (!currentUser || !user?._id || isLoading) return;

        setIsLoading(true);
        try {
            if (isFollowing) {
                await dispatch(unfollowUser({
                    targetUserId: user._id,
                    currentUserId: currentUser._id
                })).unwrap();

                const updatedUser = {
                    ...localUser,
                    followers: localUser.followers?.filter(id => id !== currentUser._id)
                };

                setIsFollowing(false);
                setLocalUser(updatedUser);
                onFollowChange?.(updatedUser); // ✅ gọi đúng lúc, an toàn
            } else {
                await dispatch(followUser({
                    targetUserId: user._id,
                    currentUserId: currentUser._id
                })).unwrap();

                const updatedUser = {
                    ...localUser,
                    followers: [...(localUser.followers || []), currentUser._id]
                };

                setIsFollowing(true);
                setLocalUser(updatedUser);
                onFollowChange?.(updatedUser); // ✅ gọi đúng lúc, an toàn
            }
        } catch (error) {
            console.error('Follow/Unfollow error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-96 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
                <img
                    className="w-16 h-16 rounded-full border-2 border-pink-500"
                    src={localUser.profile?.avatar || "https://via.placeholder.com/150"}
                    alt="avatar"
                />
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{localUser.username}</span>
                    </div>
                    <p className="text-sm text-gray-500">{localUser.fullName}</p>
                </div>
            </div>

            <div className="flex justify-around mt-4 text-center text-sm">
                <div>
                    <p className="font-bold">{localUser.postCount || 0}</p>
                    <p className="text-gray-500">posts</p>
                </div>
                <div>
                    <p className="font-bold">{localUser.followers?.length || 0}</p>
                    <p className="text-gray-500">followers</p>
                </div>
                <div>
                    <p className="font-bold">{localUser.following?.length || 0}</p>
                    <p className="text-gray-500">following</p>
                </div>
            </div>

            {currentUser._id !== localUser._id && (
                <div className="mt-4">
                    <button
                        className={`w-full py-2 rounded-md ${isFollowing
                            ? 'bg-gray-200 text-black'
                            : 'bg-blue-500 text-white'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleFollowClick}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (isFollowing ? 'Following' : 'Follow')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
