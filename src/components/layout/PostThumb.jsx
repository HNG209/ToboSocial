import {
    PictureOutlined,
    HeartOutlined,
    MessageOutlined,
    PlaySquareOutlined,
} from '@ant-design/icons';

export default function PostThumb({ post }) {
    return (
        <div className="relative rounded-lg overflow-hidden group shadow-md">
            {/* Image */}
            <img
                src="https://i.pravatar.cc/150?u=user1"
                alt="post"
                className="w-full h-auto"
            />

            {/* 🔹 Default overlay: Always visible icon */}
            <div className="absolute inset-0 bg-black/20 text-right group-hover:opacity-0 transition-opacity duration-200">
                <PlaySquareOutlined style={{ color: "white" }} className="lg:text-3xl md:text-2xl sm:text-lg mt-2 mr-2" />
            </div>

            {/* 🔸 Hover overlay: visible only on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                <p className="text-white lg:text-2xl md:text-lg sm:text-sm font-semibold">View post</p>
                <div className="flex items-center gap-4 text-white text-xl">
                    <div className="flex items-center gap-1">
                        <HeartOutlined />
                        <span>123</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageOutlined />
                        <span>45</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
