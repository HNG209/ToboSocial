import { Avatar, Button } from "antd";
import ProfileMenu from "../components/layout/ProfileMenu";
import PostThumb from "../components/layout/PostThumb";

const ProfilePage = () => {
    return (
        <>
            <div className="relative flex flex-col items-center justify-center w-full bg-gray-50 mt-2">
                <Avatar size={120} className="absolute top-0 left-0 z-10 m-4" src={`https://i.pravatar.cc/150?u=user`}>
                    <img src="https://i.pravatar.cc/150?u=user" alt="user" className="w-full object-cover max-h-[600px]" />
                </Avatar>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg w-full max-w-md mx-auto">
                    <h1 className="text-2xl font-bold">Trần Phúc Hưng</h1>
                    <a href="" className="text-purple-700 hover:text-gray-500">@hng209</a>
                    <div className="flex items-center justify-center w-full mt-4">
                        <div className="mr-4">
                            <a href="" className="font-semibold hover:text-gray-500">Followers: </a>
                            <span className="text-gray-500">100</span>
                        </div>
                        <div className="mr-4">
                            <a href="" className="font-semibold hover:text-gray-500">Following: </a>
                            <span className="text-gray-500">100</span>
                        </div>
                        <div>
                            <a href="" className="font-semibold hover:text-gray-500">Posts: </a>
                            <span className="text-gray-500">100</span>
                        </div>
                    </div>
                    <div>
                        <Button type="primary" danger className="mt-4" size="large">Edit profile</Button>
                        <Button type="default" className="mt-4 ml-2" size="large">Settings</Button>
                    </div>
                    <p className="text-gray-500 mt-2">Bio: This is a sample bio.</p>
                </div>
            </div>

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
                    {/* <div className="bg-white shadow-md rounded-lg p-4">
                        <img
                            src="https://i.pravatar.cc/150?u=user1"
                            alt="post"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <img
                            src="https://i.pravatar.cc/150?u=user2"
                            alt="post"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <img
                            src="https://i.pravatar.cc/150?u=user3"
                            alt="post"
                            className="w-full h-auto rounded-lg"
                        />
                    </div> */}
                </div>
            </div>
        </>
    )
};
export default ProfilePage;