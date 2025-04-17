import { Avatar, Button, Modal } from "antd";
import { use, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, useSetUser } from "../components/context/ProfileContext";
import { set } from "nprogress";

export default function ProfileEditPage() {
    const currentUser = useProfile(); // Fetching user data from context
    const updateUser = useSetUser(); // Fetching function to update user data from context

    const [name, setName] = useState(currentUser.name);
    const [bio, setBio] = useState(currentUser.bio);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setBio(currentUser.bio || '');
        }
    }, [currentUser]);

    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        showModal();
    }

    const handleSaveChanges = () => {
        // Logic to save changes goes here
        updateUser({ ...currentUser, name, bio }); // Update user data in context
        setIsModalOpen(false);
        console.log("Changes saved!");
        navigate('/profile'); // Redirect to profile page after saving changes
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-4 relative">
                    <Avatar size={120} className="absolute top-0 left-0 z-10 m-4" src={currentUser.avatar || `https://i.pravatar.cc/150?u=user`}>
                        <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                    </Avatar>
                </div>
                <form>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Display name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="username" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} id="bio" rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"></textarea>
                    </div>
                    <button onClick={handleSubmit} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">Save Changes</button>
                </form>
            </div>

            <Modal
                closable={false}
                centered={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}>

                <p className="text-center mb-4">Are you sure you want to save the changes?</p>
                <Button size={'medium'} className='w-full mb-2' onClick={handleSaveChanges}>
                    Confirm
                </Button>
                <Button danger size={'medium'} className='w-full mb-2' onClick={handleCancel}>
                    Cancel
                </Button>
            </Modal>
        </div>
    );
}