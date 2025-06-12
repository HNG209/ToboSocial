import React, { useRef, useState } from 'react'
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from 'react-redux';

const PostModal = ({ isOpen, onClose }) => {
    const [listFiles, setListFiles] = useState([]);
    const refTextArea = useRef(null);

    const currentUser = useSelector((state) => state.auth.user);

    const handleBackdropClick = (e) => {
        // Only close if clicked directly on the backdrop
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setListFiles((prev) => [...prev, ...files]);
    }

    const handleRemoveFile = (index) => {
        setListFiles((prev) => prev.filter((_, i) => i !== index));
    }


    return (
        <div
            onClick={handleBackdropClick}
            className={`fixed bg-black/50 inset-0 flex justify-center items-center z-50 transition-opacity duration-300 
                ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white min-h-[500] w-1/2 rounded-2xl shadow-lg transform transition-all duration-300
                ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                <div className='flex justify-center items-center p-4 border-b'>
                    <h1 className='text-3xl font-bold ml-8 text-blue-400'>
                        Tạo bài đăng
                    </h1>
                </div>

                <div className='space-y-6 p-6'>
                    <div className="flex items-center">
                        <Avatar
                            size={48}
                            src={currentUser?.profile?.avatar || `https://i.pravatar.cc/150?u=${currentUser?._id}`}
                            icon={<UserOutlined />}
                            className="border border-gray-300"
                        />
                        <div className="ml-3 text-lg font-medium">{currentUser?.username || "Guest"}</div>
                    </div>

                    <div>
                        <textarea ref={refTextArea} placeholder="Bạn đang nghĩ gì?"
                            className='w-full border border-gray-300 rounded-md p-3 resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400' />
                    </div>

                    <div className='flex items-center space-x-3'>
                        <label
                            htmlFor="media-upload"
                            className="flex cursor-pointer bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
                        >
                            <svg fill="#FFFFFF" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 67.671 67.671" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g>
                                    <path d="M52.946,23.348H42.834v6h10.112c3.007,0,5.34,1.536,5.34,2.858v26.606c0,1.322-2.333,2.858-5.34,2.858H14.724 c-3.007,0-5.34-1.536-5.34-2.858V32.207c0-1.322,2.333-2.858,5.34-2.858h10.11v-6h-10.11c-6.359,0-11.34,3.891-11.34,8.858v26.606 c0,4.968,4.981,8.858,11.34,8.858h38.223c6.358,0,11.34-3.891,11.34-8.858V32.207C64.286,27.239,59.305,23.348,52.946,23.348z"></path>
                                    <path d="M24.957,14.955c0.768,0,1.535-0.293,2.121-0.879l3.756-3.756v13.028v6v11.494c0,1.657,1.343,3,3,3s3-1.343,3-3V29.348v-6 V10.117l3.959,3.959c0.586,0.586,1.354,0.879,2.121,0.879s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242l-8.957-8.957 C35.492,0.291,34.725,0,33.958,0c-0.008,0-0.015,0-0.023,0s-0.015,0-0.023,0c-0.767,0-1.534,0.291-2.12,0.877l-8.957,8.957 c-1.172,1.171-1.172,3.071,0,4.242C23.422,14.662,24.189,14.955,24.957,14.955z"></path>
                                </g> </g>
                            </svg>
                            <div className='ml-2'>
                                Tải Ảnh / video
                            </div>
                        </label>
                        <input
                            type="file"
                            id="media-upload"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {listFiles.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Đã chọn: {listFiles.length} {listFiles.length === 1 ? 'tệp' : 'tệp tin'}
                            </div>
                        )}
                    </div>
                    {/* Media preview slider */}
                    {listFiles.length > 0 && (
                        <div className="overflow-x-auto flex space-x-4 py-4 border-t border-gray-200">
                            {listFiles.map((file, index) => {
                                const url = URL.createObjectURL(file);
                                const isVideo = file.type.startsWith('video');

                                return (

                                    <div key={index} className="relative flex-shrink-0 w-80 h-80 rounded-lg overflow-hidden border border-gray-300">
                                        {isVideo ? (
                                            <video src={url} controls className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={url} alt={`upload-${index}`} className="w-full h-full object-cover" />
                                        )}
                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="absolute bottom-1.5 right-1 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-700"
                                            title="Remove"
                                        >
                                            X
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
                <div className='flex justify-end px-6 pb-6'>
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2  text-white rounded mr-3 hover:bg-gray-400 hover:cursor-pointer transition">
                        Hủy
                    </button>
                    <button type='submit' className="bg-blue-400 px-4 py-2  text-white rounded hover:bg-blue-500 hover:cursor-pointer transition">
                        Đăng bài
                    </button>
                </div>
            </div>


        </div>
    )
}

export default PostModal