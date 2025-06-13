import {
    HomeOutlined,
    SearchOutlined,
    CompassOutlined,
    BellOutlined,
    PlusOutlined,
    UserOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, notification } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCurrentUser, logout } from "../../redux/auth/authSlice";
import tobologo from "../../assets/logo.png"
import PostModal from "../PostModal";
import { useState } from "react";
import { useEffect } from "react";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);


    // reload trang -> fetch các thông tin cần thiết vào redux state ở đây
    useEffect(() => {
        console.log('fetching')
        dispatch(getCurrentUser());
    }, [])

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            notification.success({
                message: "Logged Out",
                description: "You have been successfully logged out.",
                placement: "topRight",
            });
            navigate("/login");
        } catch (error) {
            notification.error({
                message: "Logout Failed",
                description: error || "Failed to log out. Please try again.",
                placement: "topRight",
            });
        }
    };

    const moreMenu = (
        <Menu>
            <Menu.Item key="change-password" onClick={() => navigate("/change-password")}>
                Change Password
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        { icon: <HomeOutlined />, label: "Home", to: "/" },
        { icon: <SearchOutlined />, label: "Search", to: "/search" },
        { icon: <CompassOutlined />, label: "Explore", to: "/explore" },
        { icon: <BellOutlined />, label: "Notifications", to: "/notifications" },
        { icon: <PlusOutlined />, label: "Create", to: "/create" },
        { icon: <UserOutlined />, label: "Profile", to: "/profile" },
        { icon: <MenuOutlined />, label: "More", to: "/more", dropdown: moreMenu },
    ];

    return (
        <aside className="hidden md:flex flex-col w-16 lg:w-64 bg-white border-r shadow-sm p-4">
            <PostModal isOpen={isOpen} onClose={() => setIsOpen(false)}></PostModal>
            <div className="w-[200px] h-[80px] overflow-hidden">
                <NavLink to="/">
                    <img
                        src={tobologo}
                        alt="Tobo Logo"
                        className="w-[200px] h-[80px] object-cover -m-[10px] ml-[-15px]"
                    />
                </NavLink>
            </div>

            <nav className="flex flex-col gap-6 items-center lg:items-start">
                {menuItems.map((item, idx) => (
                    item.dropdown ? (
                        <Dropdown key={idx} overlay={item.dropdown} trigger={["click"]}>
                            <div
                                className="flex items-center gap-2 hover:text-black transition-colors text-gray-700 cursor-pointer"
                            >
                                {item.icon}
                                <span className="hidden lg:inline">{item.label}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <div
                            key={idx}
                            onClick={() => {
                                if (item.to) {
                                    navigate(item.to);
                                }
                                item.label === "Create" && setIsOpen(true)
                            }}
                            className={({ isActive }) =>
                                `flex items-center gap-2 hover:text-black transition-colors ${isActive ? "text-black font-semibold" : "text-gray-700"
                                }`
                            }
                        >
                            {item.icon}
                            <span className="hidden lg:inline">{item.label}</span>
                        </div>
                    )
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;