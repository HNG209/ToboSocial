import { Avatar, Button, Modal } from "antd";
import ProfileMenu from "../components/layout/ProfileMenu";
import PostThumb from "../components/layout/PostThumb";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useProfile } from "../components/context/ProfileContext";

const ProfilePage = () => {
    const user = useProfile(); // Fetching user data from context
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

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
        <>
            <div className="relative flex flex-col items-center justify-center w-full bg-gray-50 mt-2">
                <Avatar size={120} className="absolute top-0 left-0 z-10 m-4" src={user.avatar || 'https://res.cloudinary.com/dwaldcj4v/image/upload/v1745215451/sodmg5jwxc8m2pho0i8r.jpg'}>
                    <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                </Avatar>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg w-full max-w-md mx-auto">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <a href="" className="text-purple-700 hover:text-gray-500">{`@${user.username}`}</a>
                    <div className="flex items-center justify-center w-full mt-4">
                        <div className="mr-4">
                            <a href="" className="font-semibold hover:text-gray-500">Followers: </a>
                            <span className="text-gray-500">{user.followers}</span>
                        </div>
                        <div className="mr-4">
                            <a href="" className="font-semibold hover:text-gray-500">Following: </a>
                            <span className="text-gray-500">{user.following}</span>
                        </div>
                        <div>
                            <a href="" className="font-semibold hover:text-gray-500">Posts: </a>
                            <span className="text-gray-500">{user.posts}</span>
                        </div>
                    </div>
                    <div>
                        <Button type="primary" danger className="mt-4" size="large" onClick={showModal}>Edit profile</Button>
                        <Button type="default" className="mt-4 ml-2" size="large">Settings</Button>
                    </div>
                    <p className="text-gray-500 mt-2">{user.bio}</p>
                </div>
            </div>

            <Modal
                closable={false}
                centered={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}>

                <Button size={'medium'} className='w-full mb-2' onClick={() => {navigate('/edit-profile')}}>
                    Edit personal information
                </Button>
                <Button size={'medium'} className='w-full mb-2' onClick={() => {navigate('/change-password')}}>
                    Change password
                </Button>
            </Modal>

            <div>
                <ProfileMenu />
            </div>

            <div>
                {/* <h2 className="text-2xl text-center mt-4">Posts</h2> */}
                <div className="grid grid-cols-3 gap-4 p-4">
                    {/* Map through posts and display them here */}
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                    <PostThumb post={{}} />
                </div>
            </div>
        </>
    )
};
export default React.memo(ProfilePage);