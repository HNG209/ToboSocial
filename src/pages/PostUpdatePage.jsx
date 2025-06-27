import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Form,
    Input,
    Button,
    Upload,
    message,
    Spin,
    Card,
    Modal,
} from 'antd';
import { UploadOutlined, SendOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { createPostAPI, updatePostAPI } from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPost } from '../redux/post/selectedPostSlice';
import useGlobalNotification from '../hooks/useGlobalNotification';

const { TextArea } = Input;

const PostUpdatePage = () => {
    const dispatch = useDispatch();
    const notify = useGlobalNotification();
    const navigate = useNavigate();

    const { id } = useParams(); //post ID
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [localFiles, setLocalFiles] = useState([]);
    const [removeOnCloud, setRemoveOnCloud] = useState([]) // chứa các ảnh sẽ bị xoá trên cloud sau khi cập nhật
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const user = useSelector((state) => state.auth.user); // Lấy user từ Redux

    const currentPost = useSelector(state => state.selectedPost.post)

    const CLOUDINARY_UPLOAD_PRESET = 'testUploadImage';
    const CLOUDINARY_CLOUD_NAME = 'dai4ctigv';

    useEffect(() => {
        dispatch(fetchPost(id))
    }, [id])

    useEffect(() => {
        form.setFieldsValue({
            caption: currentPost.caption
        });
    }, [currentPost, form])

    useEffect(() => {
        if (!currentPost.mediaFiles) return;
        setLocalFiles([...localFiles, ...currentPost.mediaFiles])
    }, [currentPost.mediaFiles])

    const handleRemoveLocalFile = (index) => {
        if (localFiles[index].url && !localFiles[index].previewUrl) {
            // là file đã upload lên Cloud (có url, không phải file local preview)
            setRemoveOnCloud(prev => [
                ...prev,
                {
                    url: localFiles[index].url,
                    public_id: localFiles[index].public_id,
                }
            ]);
        }
        setLocalFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
        setPreviewVisible(true);
    };

    const handleSubmit = async (values) => {
        if (!user?._id) {
            message.error('Vui lòng đăng nhập để chỉnh sửa bài viết');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload các localFiles mới (nếu có)
            const uploadedFiles = [];

            for (let fileObj of localFiles) {
                if (fileObj.file) { // file mới chọn chưa upload
                    const uploadData = new FormData();
                    uploadData.append('file', fileObj.file);
                    uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                    const response = await axios.post(
                        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                        uploadData
                    );

                    uploadedFiles.push({
                        url: response.data.secure_url,
                        type: response.data.resource_type === 'video' ? 'video' : 'image',
                        public_id: response.data.public_id,
                    });
                } else if (fileObj.url) {
                    // file cũ đã có url → giữ lại
                    uploadedFiles.push({
                        url: fileObj.url,
                        type: fileObj.type,
                        public_id: fileObj.public_id || null,
                    });
                }
            }

            // 2. Tạo object postData
            const postData = {
                postId: id,
                author: user._id,
                caption: values.caption,
                mediaFiles: uploadedFiles,
                removeFiles: removeOnCloud, // gửi về để BE xử lý xoá Cloudinary nếu muốn
            };

            // 3. Gọi API
            await updatePostAPI(postData);

            notify.success('Cập nhật thành công!', 'Bài viết đã được cập nhật')

            // 4. Reset state
            form.resetFields();
            setLocalFiles([]);
            setRemoveOnCloud([]);
            setMediaFiles([]);
        } catch (err) {
            notify.error('Lỗi khi cập nhật', err.message || 'Không thể cập nhật bài viết')
        } finally {
            setLoading(false);
            navigate('/profile');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Card className="shadow-md rounded-lg">
                <h3 className="text-indigo-800 mb-4 text-xl font-semibold">
                    <EditOutlined /> Chỉnh sửa bài đăng
                </h3>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-4"
                >
                    <Form.Item
                        name="caption"
                        label="Nội dung bài viết"
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung bài viết' },
                            { max: 500, message: 'Nội dung không được vượt quá 500 ký tự' },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            showCount
                            maxLength={500}
                            disabled={loading || uploading}
                            className="rounded-lg"
                        />
                    </Form.Item>
                    <Form.Item
                        name="mediaFiles"
                        label="Ảnh/Video"
                    // rules={[
                    //     {
                    //         validator: () => {
                    //             if (mediaFiles.length === 0) {
                    //                 return Promise.reject(new Error('Vui lòng tải lên ít nhất một ảnh hoặc video'));
                    //             }
                    //             return Promise.resolve();
                    //         },
                    //     },
                    // ]}
                    >
                        <Upload
                            beforeUpload={(file) => {
                                // kiểm tra định dạng
                                if (!['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'].includes(file.type)) {
                                    message.error('Chỉ hỗ trợ ảnh (JPEG, PNG, GIF) hoặc video (MP4, WebM)');
                                    return Upload.LIST_IGNORE;
                                }

                                const previewUrl = URL.createObjectURL(file);
                                setLocalFiles(prev => [
                                    ...prev,
                                    {
                                        file,
                                        previewUrl,
                                        type: file.type.startsWith('video') ? 'video' : 'image',
                                    }
                                ]);
                                return false; // không upload tự động
                            }}
                            showUploadList={false}
                            accept="image/*,video/*"
                            multiple
                            disabled={loading || uploading}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploading}
                                className="border-gray-300 hover:bg-gray-100 rounded-lg"
                            >
                                Chọn ảnh hoặc video
                            </Button>
                        </Upload>

                        {localFiles.length > 0 && (
                            <div className="mt-2">
                                <span style={{ fontWeight: 'bold' }}>Chưa upload ({localFiles.length}) file:</span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    {localFiles.map((fileObj, index) => (
                                        <div key={index} style={{ position: 'relative', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                                            {fileObj.type === 'image' ? (
                                                <img
                                                    src={fileObj.previewUrl || fileObj.url}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                                    onClick={() => handlePreview(fileObj)}
                                                />
                                            ) : (
                                                <video
                                                    src={fileObj.previewUrl || fileObj.url}
                                                    controls
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                                    onClick={() => handlePreview(fileObj)}
                                                />
                                            )}
                                            <Button
                                                type="danger"
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                onClick={() => handleRemoveLocalFile(index)}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255, 0, 0, 0.7)', border: 'none' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            htmlType="submit"
                            loading={loading}
                            disabled={loading || uploading}
                            className="bg-indigo-500 hover:bg-indigo-600 rounded-lg"
                        >
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
                <Spin spinning={uploading || loading} />
            </Card>
            <style jsx>{`
                .ant-btn-danger:hover {
                    background: rgba(255, 0, 0, 1) !important;
                }
                .ant-upload-select {
                    margin-bottom: 10px;
                }
                .ant-modal-content {
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default PostUpdatePage;