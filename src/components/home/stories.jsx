import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useRef } from "react";

const users = [
    { name: "meichann...", avatar: "https://i.pravatar.cc/150?img=1" },
    { name: "ferrari", avatar: "https://i.pravatar.cc/150?img=2" },
    { name: "lalalalisa_m", avatar: "https://i.pravatar.cc/150?img=3" },
    { name: "meakcodes", avatar: "https://i.pravatar.cc/150?img=4" },
    { name: "neymarjsi...", avatar: "https://i.pravatar.cc/150?img=5" },
    { name: "neymarjr", avatar: "https://i.pravatar.cc/150?img=6" },
    { name: "karimbenz...", avatar: "https://i.pravatar.cc/150?img=7" },
    { name: "vexking", avatar: "https://i.pravatar.cc/150?img=8" },
];

const Stories = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = direction === "left" ? -180 : 180; // scroll khoảng 2-3 avatar
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    return (
        <div className="relative flex items-center bg-white p-4 border-b">
            {/* Left Arrow */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-2 z-10 bg-white shadow-md rounded-full p-1"
            >
                <LeftOutlined />
            </button>

            {/* Scrollable Story Container */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto no-scrollbar gap-4 px-10"
            >
                {users.map((user, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center text-center w-16 shrink-0"
                    >
                        <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] rounded-full">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-14 h-14 object-cover rounded-full border-2 border-white"
                            />
                        </div>
                        <span className="text-xs mt-1 truncate">{user.name}</span>
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scroll("right")}
                className="absolute right-2 z-10 bg-white shadow-md rounded-full p-1"
            >
                <RightOutlined />
            </button>
        </div>
    );
};

export default Stories;
