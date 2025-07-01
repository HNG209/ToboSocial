import {
    HomeOutlined,
    SearchOutlined,
    CompassOutlined,
    PlusOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";

// Bottom nav khi kích thước màn hình thu nhỏ
const BottomNav = () => {
    const menuItems = [
        { icon: <HomeOutlined style={{ fontSize: '24px' }} />, label: "Home", to: "/" },
        { icon: <SearchOutlined style={{ fontSize: '24px' }} />, label: "Search", to: "/search" },
        { icon: <PlusOutlined style={{ fontSize: '24px' }} />, label: "Create", to: "/create" },
        { icon: <CompassOutlined style={{ fontSize: '24px' }} />, label: "Explore", to: "/explore" },
        { icon: <UserOutlined style={{ fontSize: '24px' }} />, label: "Profile", to: "/profile" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
            {menuItems.map((item, idx) => (
                <NavLink
                    key={idx}
                    to={item.to}
                    className={({ isActive }) =>
                        `flex items-center justify-center text-gray-700 hover:text-black transition-colors ${isActive ? "text-black" : ""
                        }`
                    }
                >
                    {item.icon}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;