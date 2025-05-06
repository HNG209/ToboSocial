import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/auth/authSlice";

const navLinks = [
    { to: "/admin", label: "Dashboard", exact: true, tooltip: "View admin dashboard" },
    { to: "/admin/users", label: "Users", tooltip: "Manage users" },
    { to: "/admin/posts", label: "Posts", tooltip: "Manage posts" },
    { to: "/admin/reports", label: "Reports", tooltip: "View reports" },
    { to: "/admin/account", label: "Account", tooltip: "Manage your account" },
];

const NavItem = React.memo(({ to, label, exact, tooltip, onClick }) => (
    <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
            `relative flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 group ${isActive
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-200 hover:bg-indigo-500/20 hover:text-white"
            }`
        }
        onClick={onClick}
        aria-label={tooltip}
    >
        <span className="flex-1">{label}</span>
        <span className="absolute left-0 top-0 hidden group-hover:block group-hover:opacity-100 opacity-0 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded-md py-1 px-2 -ml-28">
            {tooltip}
        </span>
    </NavLink>
));

const AdminLayout = () => {
    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await dispatch(logout()).unwrap();
            navigate("/login");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        const listener = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, []);

    const renderLink = useCallback(
        ({ to, label, exact, tooltip }) => (
            <NavItem
                key={to}
                to={to}
                label={label}
                exact={exact}
                tooltip={tooltip}
                onClick={() => setOpen(false)}
            />
        ),
        []
    );

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Mobile Header */}
            <header className="flex items-center justify-between bg-gradient-to-r from-indigo-900 to-gray-900 px-4 py-3 md:hidden shadow-lg fixed top-0 left-0 right-0 z-50">
                <h1 className="text-xl font-semibold tracking-wide text-white">Admin Panel</h1>
                <button
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen(!open)}
                    className="text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: open || window.innerWidth >= 768 ? 0 : -280 }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 z-40 w-72 h-screen bg-gradient-to-b from-indigo-900 to-gray-900 text-white px-6 pt-8 pb-4 shadow-2xl overflow-hidden"
            >
                <h2 className="hidden md:block mb-8 text-2xl font-bold tracking-wide text-white">Admin Panel</h2>
                <nav className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-hidden">
                    {navLinks.map(renderLink)}
                </nav>
            </motion.aside>

            {/* Backdrop on mobile */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Right column: desktop header + content */}
            <div className="flex-1 flex flex-col md:ml-72">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-end bg-white shadow-md px-6 py-3 sticky top-0 z-20">
                    <span className="mr-4 font-medium text-gray-700 truncate max-w-[150px]">
                        {user?.username || "Admin"}
                    </span>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 ${isLoggingOut
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-indigo-100 hover:border-indigo-500"
                            }`}
                        aria-label="Logout"
                    >
                        {isLoggingOut ? (
                            <svg
                                className="animate-spin h-4 w-4 text-gray-700"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        )}
                        Logout
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 bg-gray-100 p-4 sm:p-6 md:p-8 overflow-y-auto mt-[60px] md:mt-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;