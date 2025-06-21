import { Modal } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../redux/notification/notificationSlice";
import useGlobalNotification from "../../hooks/useGlobalNotification";

const CommentEditor = ({ user, comment, onSave, onCancel }) => {
    const notify = useGlobalNotification();

    const [text, setText] = useState(comment?.text || "");

    const handleSave = () => {
        Modal.confirm({
            title: 'Xác nhận cập nhật',
            content: 'Bạn có chắc chắn muốn cập nhật bình luận này không?',
            okText: 'Cập nhật',
            okType: 'primary',
            cancelText: 'Huỷ',
            onOk() {
                if (onSave) onSave(text);
                notify.success('Cập nhật thành công!', 'Bình luận đã được cập nhật')
            },
        });
    };

    return (
        <div className="p-3 bg-white rounded shadow-sm">
            <div className="flex items-center mb-2">
                <img
                    src={user?.profile?.avatar || "https://i.pravatar.cc/150?u=user"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <span className="font-semibold">@{user?.username}</span>
            </div>
            <textarea
                className="w-full border rounded p-2 mb-3 resize-none"
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
                <button
                    className={`px-4 py-1 rounded font-semibold 
        ${comment.text.trim() === text.trim() || !text.trim()
                            ? 'bg-blue-200 text-white cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    onClick={handleSave}
                    disabled={comment.text.trim() === text.trim() || !text.trim()}
                >
                    Lưu
                </button>
                <button
                    className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={onCancel}
                >
                    Huỷ
                </button>
            </div>
        </div >
    );
};

export default CommentEditor;