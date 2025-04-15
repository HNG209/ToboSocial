// src/layout/Sidebar.jsx
import {
    HomeOutlined,
    SearchOutlined,
    CompassOutlined,
    VideoCameraOutlined,
    MessageOutlined,
    HeartOutlined,
    PlusOutlined,
    UserOutlined,
    GlobalOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { DiVisualstudio } from "react-icons/di";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const menuItems = [
        { icon: <HomeOutlined />, label: "Home", to: "/" },
        { icon: <SearchOutlined />, label: "Search", to: "/search" },
        { icon: <CompassOutlined />, label: "Explore", to: "/explore" },
        { icon: <VideoCameraOutlined />, label: "Reels", to: "/reels" },
        { icon: <MessageOutlined />, label: "Messages", to: "/messages" },
        { icon: <HeartOutlined />, label: "Notifications", to: "/notifications" },
        { icon: <PlusOutlined />, label: "Create", to: "/create" },
        { icon: <UserOutlined />, label: "Profile", to: "/profile" },
        { icon: <DiVisualstudio />, label: "AI Studio", to: "/studio" },
        { icon: <GlobalOutlined />, label: "Threads", to: "/threads" },
        { icon: <MenuOutlined />, label: "More", to: "/more" },
    ];

    return (
        <aside className="hidden md:flex flex-col w-16 lg:w-64 bg-white border-r shadow-sm p-4">
            <div className="text-center font-bold mb-8 text-lg hidden lg:block">Instagram</div>
            <nav className="flex flex-col gap-6 items-center lg:items-start">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 hover:text-black transition-colors ${isActive ? "text-black font-semibold" : "text-gray-700"
                            }`
                        }
                    >
                        {item.icon}
                        <span className="hidden lg:inline">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
