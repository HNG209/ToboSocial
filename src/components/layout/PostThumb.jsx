import {
    PictureOutlined,
    HeartOutlined,
    MessageOutlined,
    PlaySquareOutlined,
} from '@ant-design/icons';

export default function PostThumb({ post }) {
    return (
        <div className="relative rounded-lg overflow-hidden group shadow-md aspect-square w-full">
            {/* Image */}
            <img
                src={(post.mediaFiles?.[0]?.url) || "https://via.placeholder.com/300"}
                alt="post"
                className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                <p className="text-white text-lg font-semibold">View post</p>
                <div className="flex items-center gap-4 text-white text-sm">
                    <div className="flex items-center gap-1">
                        <HeartOutlined />
                        <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageOutlined />
                        <span>{post.comments.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
