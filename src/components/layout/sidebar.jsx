import {
    HomeOutlined,
    SearchOutlined,
    CompassOutlined,
    BellOutlined,
    PlusOutlined,
    UserOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { Badge, Drawer, Dropdown, Menu, message, notification } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthUser, logout } from "../../redux/auth/authSlice";
import tobologo from "../../assets/logo.png"
import PostModal from "../PostModal";
import { useState } from "react";
import { useEffect } from "react";
import socket from "../../socket";
import { appendNotification } from "../../redux/notification/user.notifications.slice";

// Sidebar khi kích thước md, lg
const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const authUser = useSelector(state => state.auth.user);
    const unRead = useSelector(state => state.userNotifications.unRead);

    useEffect(() => {
        if (!authUser) return;

        socket.connect();

        // Chỉ join sau khi đã connect thành công
        socket.on('connect', () => {
            socket.emit('join', authUser._id); // Gửi lại userId để vào đúng room
        });

        socket.on('notify', (data) => {
            console.log('recieve', data);
            dispatch(appendNotification(data));
            message.info('[Socket] ' + data.message);
        });

        return () => {
            socket.off('notify');
            socket.off('connect');
        };
    }, [authUser]);


    // reload trang -> fetch các thông tin cần thiết vào redux state ở đây
    useEffect(() => {
        dispatch(getAuthUser());
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
        {
            icon:
                <BellOutlined />
            , label: "Notifications", to: "/notifications"
        },
        { icon: <PlusOutlined />, label: "Create", to: "/create" },
        { icon: <UserOutlined />, label: "Profile", to: "/profile" },
        { icon: <MenuOutlined />, label: "More", to: "/more", dropdown: moreMenu },
    ];

    return (
        <aside className="hidden md:flex flex-col my-5 ml-3 w-20 lg:w-64 bg-white rounded-lg shadow-2xl p-4">
            <PostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Logo phóng to và có padding đều */}
            <div className="flex justify-center mb-6 pt-2">
                <NavLink to="/" className="block w-full">
                    <div className="flex justify-center items-center">
                        <img
                            src={tobologo}
                            className="w-50 h-10 object-cover object-center"
                        />
                    </div>
                </NavLink>
            </div>



            {/* Menu items dời lên gần logo */}
            <nav className="flex flex-col gap-3 items-center lg:items-start">
                {menuItems.map((item, idx) =>
                    item.dropdown ? (
                        <Dropdown key={idx} overlay={item.dropdown} trigger={["click"]}>
                            <div className="flex items-center gap-4 px-4 py-2 rounded-xl w-full cursor-pointer text-blue-600 hover:text-black hover:bg-gray-50 transition-all duration-200">
                                <span className="text-xl">{item.icon}</span>
                                <span className="hidden lg:inline text-sm">{item.label}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <NavLink
                            key={idx}
                            to={item.to}
                            className={({ isActive }) =>
                                `group flex items-center justify-center lg:justify-start gap-4 px-4 py-2 rounded-xl cursor-pointer
                            ${isActive
                                    ? "bg-blue-100 w-full text-blue-500 font-semibold"
                                    : "text-blue-600 w-full hover:text-black hover:bg-gray-50"} 
                                transition-all duration-200`
                            }
                        >
                            {
                                item.label === 'Notifications' ?
                                    <Badge size="small" count={unRead} overflowCount={99}>
                                        <span className="text-xl text-blue-600 w-full hover:text-black hover:bg-gray-50">{item.icon}</span>
                                    </Badge>
                                    :
                                    <span className="text-xl">{item.icon}</span>
                            }
                            <span className="hidden lg:inline text-sm">{item.label}</span>
                        </NavLink>
                    )
                )}
            </nav>
        </aside >


    );
};

export default Sidebar;