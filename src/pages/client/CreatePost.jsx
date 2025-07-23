import React, { useState } from "react";
import { Form, Input, Button, Upload, message, Spin, Card, Modal } from "antd";
import {
  UploadOutlined,
  SendOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { createPostAPI } from "../../services/post.service";

const { TextArea } = Input;

const CreatePost = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const handleRemoveLocalFile = (index) => {
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
    form.validateFields(["mediaFiles"]); // Trigger validation sau khi xóa
    message.success("Đã xóa file");
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const handleCancelPreview = () => {
    setPreviewVisible(false);
    setPreviewFile(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const postData = {
        caption: values.caption,
      };

      const uploadData = new FormData();
      uploadData.append("content", JSON.stringify(postData));
      localFiles.forEach((i) => {
        uploadData.append("mediaFiles", i.file);
      });

      await createPostAPI(uploadData);
      message.success("Bài viết đã được tạo thành công");
      form.resetFields();
      setLocalFiles([]);
    } catch (err) {
      message.error(err.message || "Không thể tạo bài viết");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-md rounded-lg">
        <h3 className="text-indigo-800 mb-4 text-xl font-semibold">
          <SendOutlined /> Tạo bài viết mới
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
              { required: true, message: "Vui lòng nhập nội dung bài viết" },
              { max: 500, message: "Nội dung không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea
              placeholder="Bạn đang nghĩ gì?"
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
            rules={[
              {
                validator: () => {
                  if (localFiles.length === 0) {
                    return Promise.reject(
                      new Error("Vui lòng tải lên ít nhất một ảnh hoặc video")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload
              beforeUpload={(file) => {
                // kiểm tra định dạng
                if (
                  ![
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "video/mp4",
                    "video/webm",
                  ].includes(file.type)
                ) {
                  message.error(
                    "Chỉ hỗ trợ ảnh (JPEG, PNG, GIF) hoặc video (MP4, WebM)"
                  );
                  return Upload.LIST_IGNORE;
                }

                const previewUrl = URL.createObjectURL(file);
                setLocalFiles((prev) => [
                  ...prev,
                  {
                    file,
                    previewUrl,
                    type: file.type.startsWith("video") ? "video" : "image",
                  },
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
                <span style={{ fontWeight: "bold" }}>
                  Chưa upload ({localFiles.length}) file:
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {localFiles.map((fileObj, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        border: "1px solid #e8e8e8",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      {fileObj.type === "image" ? (
                        <img
                          src={fileObj.previewUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                          }}
                          onClick={() => handlePreview(fileObj)}
                        />
                      ) : (
                        <video
                          src={fileObj.previewUrl}
                          controls
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                          }}
                          onClick={() => handlePreview(fileObj)}
                        />
                      )}
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleRemoveLocalFile(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "rgba(255, 0, 0, 0.7)",
                          border: "none",
                        }}
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
              icon={<SendOutlined />}
              htmlType="submit"
              loading={loading}
              disabled={loading || uploading}
              className="bg-indigo-500 hover:bg-indigo-600 rounded-lg"
            >
              Đăng bài
            </Button>
          </Form.Item>
        </Form>
        <Spin spinning={uploading || loading} />
      </Card>
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={handleCancelPreview}
        width="80%"
        style={{ maxWidth: "800px" }}
        bodyStyle={{ padding: 0, textAlign: "center" }}
      >
        {previewFile &&
          (previewFile.type === "image" ? (
            <img
              src={previewFile.url}
              alt="Full Preview"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          ) : (
            <video
              src={previewFile.url}
              controls
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          ))}
      </Modal>
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

export default CreatePost;
