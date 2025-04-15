import {
    AiOutlineHome,
    AiOutlineSearch,
    AiOutlineVideoCamera,
    AiOutlinePlusCircle,
    AiOutlineUser,
} from "react-icons/ai";

const BottomNav = () => {
    const menuItems = [
        { icon: <AiOutlineHome size={24} />, label: "Home" },
        { icon: <AiOutlineSearch size={24} />, label: "Search" },
        { icon: <AiOutlineVideoCamera size={24} />, label: "Reels" },
        { icon: <AiOutlinePlusCircle size={24} />, label: "Create" },
        { icon: <AiOutlineUser size={24} />, label: "Profile" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
            {menuItems.map((item, idx) => (
                <a
                    key={idx}
                    href="#"
                    className="text-gray-700 hover:text-black"
                >
                    {item.icon}
                </a>
            ))}
        </nav>
    );
};

export default BottomNav;