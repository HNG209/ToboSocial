import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex-shrink-0 shadow-lg">
                <h2 className="text-2xl font-bold mb-8 tracking-wide">Admin Panel</h2>
                <nav className="flex flex-col space-y-3">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Users
                    </NavLink>
                    <NavLink
                        to="/admin/posts"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Posts
                    </NavLink>
                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Reports
                    </NavLink>
                    <NavLink
                        to="/admin/account"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Account
                    </NavLink>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-100 p-6 md:p-8 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
