import { Avatar, Button, Modal } from "antd";
import ProfileMenu from "../components/layout/ProfileMenu";
import PostThumb from "../components/layout/PostThumb";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchPostByUser, followUser, getCurrentUser, setStatus, unfollowUser } from "../redux/profile/profileSlice";
import { EditOutlined, MenuOutlined, SendOutlined, SettingOutlined, UserAddOutlined } from "@ant-design/icons";
import { fetchProfilePosts } from "../services/api.service";

const ProfilePage = () => {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'self' | 'other'
    const [userData, setUserData] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const posts = useSelector((state) => state.profile.posts);
    const authUser = useSelector((state) => state.auth.user); // fetch ở sidebar khi refresh
    const profileUser = useSelector((state) => state.profile.user); // fetch khi có id
    const status = useSelector((state) => state.profile.status);

    useEffect(() => {
        if (status !== 'idle') return;
        dispatch(fetchPostByUser({ id, page: 1, limit: 10 }));
        if (!id) return;
        dispatch(getCurrentUser({ id }));
        return;
    }, [dispatch, status]);

    useEffect(() => {
        if (!authUser && !profileUser) return;

        setUserData(id ? profileUser : authUser);
    }, [authUser, profileUser, id]);

    useEffect(() => {
        dispatch(setStatus('idle'))
    }, [id]);

    const showModal = (type) => {
        setModalType(type); // 'self' or 'other'
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleUserFollow = (id) => {
        dispatch(followUser(id));
    };

    const handleUserUnfollow = (id) => {
        dispatch(unfollowUser(id));
    };

    return (
        <>
            <div className="relative flex flex-col items-center justify-center w-full bg-gray-50 mt-2">
                <Avatar
                    className="border-2 border-white shadow-lg"
                    size={{ xs: 90, sm: 90, md: 100, lg: 120, xl: 140, xxl: 160 }}
                    src={userData?.profile?.avatar || 'https://res.cloudinary.com/...'}
                >
                    <img
                        src="https://i.pravatar.cc/150?u=user"
                        alt="user"
                        className="w-full h-full object-cover"
                    />
                </Avatar>


                <div className="flex flex-col items-center justify-center mt-2 rounded-lg w-full max-w-md mx-auto">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold break-words">
                        {userData?.fullName}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-purple-700 hover:text-gray-500 break-words">
                        @{userData?.username}
                    </p>

                    <div className="flex items-center justify-center w-full mt-4">
                        <div className="mr-4">
                            <a href="#" className="font-semibold hover:text-gray-500">Followers: </a>
                            <span className="text-gray-500">{userData?.countFollower}</span>
                        </div>
                        <div className="mr-4">
                            <a href="#" className="font-semibold hover:text-gray-500">Following: </a>
                            <span className="text-gray-500">{userData?.countFollowing}</span>
                        </div>
                        <div>
                            <a href="#" className="font-semibold hover:text-gray-500">Posts: </a>
                            <span className="text-gray-500">{userData?.postCount}</span>
                        </div>
                    </div>
                    <div className="flex w-full max-w-xs gap-2 mt-4 flex-wrap justify-center">
                        {
                            id === undefined ? (
                                <Button
                                    type="primary"
                                    danger
                                    icon={<EditOutlined />}
                                    className="flex-1 min-w-[70px] max-w-[160px] text-sm !h-9"
                                    size="middle"
                                    onClick={() => showModal('self')}
                                >
                                    Edit
                                </Button>
                            ) : userData?.isFollowedByCurrentUser ? (
                                <Button
                                    danger
                                    icon={<MenuOutlined />}
                                    className="flex-1 min-w-[70px] max-w-[160px] text-sm !h-9"
                                    size="middle"
                                    onClick={() => showModal('other')}
                                >
                                    Followed
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleUserFollow(id)}
                                    icon={<UserAddOutlined />}
                                    type="primary"
                                    className="flex-1 min-w-[70px] max-w-[160px] text-sm !h-9"
                                    size="middle"
                                >
                                    Follow
                                </Button>
                            )
                        }

                        {
                            id === undefined ? (
                                <Button
                                    type="default"
                                    icon={<SettingOutlined />}
                                    className="flex-1 min-w-[70px] max-w-[160px] text-sm !h-9"
                                    size="middle"
                                >
                                    Settings
                                </Button>
                            ) : (
                                <Button
                                    type="default"
                                    icon={<SendOutlined rotate={-45} />}
                                    className="flex-1 min-w-[70px] max-w-[160px] text-sm !h-9"
                                    size="middle"
                                >
                                    Message
                                </Button>
                            )
                        }
                    </div>

                    <p className="text-gray-500 mt-2">{userData?.profile?.bio}</p>
                </div>
            </div>

            {/* Modal hiển thị tùy theo modalType */}
            <Modal
                closable={false}
                centered
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                {modalType === 'self' ? (
                    <>
                        <Button size="medium" className="w-full mb-2" onClick={() => {
                            navigate('/edit-profile');
                            handleCancel();
                        }}>
                            Edit personal information
                        </Button>
                        <Button size="medium" className="w-full mb-2" onClick={() => {
                            navigate('/change-password');
                            handleCancel();
                        }}>
                            Change password
                        </Button>
                    </>
                ) : (
                    <>
                        <Button danger size="medium" className="w-full mb-2" onClick={() => {
                            handleUserUnfollow(id); // unfollow
                            handleCancel();
                        }}>
                            Unfollow
                        </Button>
                        <Button size="medium" className="w-full" onClick={() => {
                            navigate('/report-user/' + id);
                            handleCancel();
                        }}>
                            Report this user
                        </Button>
                    </>
                )}
            </Modal>

            <div>
                <ProfileMenu />
            </div>

            <div>
                <div className="grid grid-cols-3 gap-4 p-4">
                    {
                        posts.map((post, index) => (
                            <PostThumb key={index} post={post} />
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export default React.memo(ProfilePage);
