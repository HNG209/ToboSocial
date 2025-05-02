import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white p-4 space-y-4">
                <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
                <nav className="flex flex-col space-y-2">
                    <NavLink to="/admin" end className="hover:text-blue-400">Dashboard</NavLink>
                    <NavLink to="/admin/users" className="hover:text-blue-400">Users</NavLink>
                    <NavLink to="/admin/posts" className="hover:text-blue-400">Posts</NavLink>
                    <NavLink to="/admin/reports" className="hover:text-blue-400">Reports</NavLink>
                    <NavLink to="/admin/comments" className="hover:text-blue-400">Comments</NavLink>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-100 p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
