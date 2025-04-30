import React, { useState, useEffect } from "react";
import { Input, Avatar } from "antd";
import debounce from "lodash.debounce";
import { Link } from "react-router-dom";
import { searchUsersAPI } from "../../services/user.service";
import { useSelector } from "react-redux";

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id;

    const handleSearch = debounce(async (val) => {
        if (!val) {
            setResults([]);
            return;
        }
        try {
            const res = await searchUsersAPI(val);
            const filtered = res.filter(user => user._id !== currentUserId);
            setResults(filtered || []);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
    }, 400);

    useEffect(() => {
        handleSearch(query);
        return () => handleSearch.cancel();
    }, [query]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Search Users</h1>
            <Input
                placeholder="Enter username or full name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="large"
                allowClear
                className="mb-6"
            />

            {results.length === 0 && query && (
                <p className="text-gray-500">No matching results found.</p>
            )}

            <div className="space-y-4">
                {results.map((user) => (
                    <Link
                        to={`/profile/${user.username}`}
                        key={user._id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded transition"
                    >
                        <Avatar
                            size={48}
                            src={user.profile?.avatar || `https://i.pravatar.cc/150?u=${user._id}`}
                        />
                        <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-gray-500">{user.fullName}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;