import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Input,
    Button,
    Avatar,
    Select,
    Upload,
    message,
    Form,
    Tabs,
    Typography,
    Tooltip,
    Alert,
    Spin,
    Space,
} from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { getCurrentUserAPI, updateUserProfileAPI, updateUserPasswordAPI } from '../../services/admin.service';
import axios from 'axios';
import 'animate.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [formData, setFormData] = useState({
        _id: '',
        username: '',
        email: '',
        fullName: '',
        phone: '',
        profile: {
            bio: '',
            website: '',
            avatar: '',
            gender: 'other',
        },
    });
    const [passwordData, setPasswordData] = useState({
        _id: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const CLOUDINARY_UPLOAD_PRESET = 'testUploadImage';
    const CLOUDINARY_CLOUD_NAME = 'dai4ctigv';

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await getCurrentUserAPI();
                const userData = response;
                setUser(userData);
                setFormData({
                    _id: userData._id || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    profile: {
                        bio: userData.profile?.bio || '',
                        website: userData.profile?.website || '',
                        avatar: userData.profile?.avatar || '',
                        gender: userData.profile?.gender || 'other',
                    },
                });
                setPasswordData((prev) => ({
                    ...prev,
                    _id: userData._id || '',
                }));
                profileForm.setFieldsValue({
                    username: userData.username || '',
                    email: userData.email || '',
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    gender: userData.profile?.gender || 'other',
                    website: userData.profile?.website || '',
                    bio: userData.profile?.bio || '',
                });
            } catch (err) {
                message.error(err.message || 'Không thể tải dữ liệu người dùng');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [profileForm]);

    const handleProfileUpdate = async () => {
        try {
            await profileForm.validateFields();
            setLoading(true);
            const response = await updateUserProfileAPI(formData);
            setUser(response);
            message.success('Hồ sơ đã được cập nhật thành công');
        } catch (err) {
            message.error(err.message || 'Không thể cập nhật hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        try {
            await passwordForm.validateFields();
            setLoading(true);
            await updateUserPasswordAPI({
                _id: passwordData._id,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            message.success('Mật khẩu đã được cập nhật thành công');
            setPasswordData({ _id: user?._id || '', currentPassword: '', newPassword: '', confirmPassword: '' });
            passwordForm.resetFields();
        } catch (err) {
            message.error(err.message || 'Không thể cập nhật mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async ({ file }) => {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            message.error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF)');
            return;
        }

        setUploadingAvatar(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                uploadData
            );

            const avatarUrl = response.data.secure_url;
            setFormData((prev) => ({
                ...prev,
                profile: { ...prev.profile, avatar: avatarUrl },
            }));
            setUser((prev) => ({
                ...prev,
                profile: { ...prev.profile, avatar: avatarUrl },
            }));
            message.success('Avatar đã được tải lên thành công');
        } catch (err) {
            message.error(err.message || 'Không thể tải lên avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-100">
            <Title level={2} className="text-indigo-800 mb-6">
                <Space>
                    <UserOutlined />
                    Cài đặt tài khoản
                </Space>
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <Card
                        className="animate__animated animate__fadeIn rounded-3xl border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow text-center"
                        bordered={false}
                    >
                        <Spin spinning={uploadingAvatar}>
                            <Avatar
                                size={128}
                                src={formData.profile.avatar || '/placeholder.svg'}
                                icon={<UserOutlined />}
                                className="mb-4 border-4 border-gray-100 rounded-full"
                            />
                        </Spin>
                        <Title level={4} className="text-indigo-800">
                            {formData.fullName || formData.username || 'Người dùng'}
                        </Title>
                        <Text type="secondary" className="block mb-2">
                            {formData.profile.bio || 'Chưa có mô tả'}
                        </Text>
                        {formData.profile.website && (
                            <Text type="link">
                                <a href={formData.profile.website} target="_blank" rel="noopener noreferrer">
                                    {formData.profile.website}
                                </a>
                            </Text>
                        )}
                        <div>
                            <Tooltip title="Tải lên avatar mới (JPEG, PNG, GIF)">
                                <Upload
                                    customRequest={handleAvatarUpload}
                                    showUploadList={false}
                                    accept="image/*"
                                    disabled={loading || uploadingAvatar}
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        loading={uploadingAvatar}
                                        className="mt-4 border-gray-300 hover:bg-gray-100 rounded-lg"
                                    >
                                        Thay đổi avatar
                                    </Button>
                                </Upload>
                            </Tooltip>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card
                        className="animate__animated animate__fadeIn rounded-3xl border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow"
                        bordered={false}
                    >
                        <Tabs defaultActiveKey="profile" className="rounded-xl">
                            <TabPane
                                tab={
                                    <Space>
                                        <UserOutlined />
                                        Thông tin cá nhân
                                    </Space>
                                }
                                key="profile"
                            >
                                <Alert
                                    message="Thông tin tài khoản"
                                    description={
                                        <Space>
                                            <Avatar
                                                src={formData.profile.avatar}
                                                icon={<UserOutlined />}
                                                size={32}
                                                className="border-2 border-gray-100"
                                            />
                                            <div>
                                                <Text strong>{formData.username || 'Người dùng'}</Text>
                                                <br />
                                                <Text type="secondary">{formData.email || 'Chưa có email'}</Text>
                                            </div>
                                        </Space>
                                    }
                                    type="info"
                                    showIcon
                                    className="mb-4"
                                />
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleProfileUpdate}
                                    className="mt-4"
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="username"
                                                label="Tên đăng nhập"
                                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                                            >
                                                <Input
                                                    placeholder="Tên đăng nhập"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="fullName"
                                                label="Họ và tên"
                                            >
                                                <Input
                                                    placeholder="Họ và tên"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Số điện thoại"
                                                rules={[
                                                    { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Số điện thoại"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="gender"
                                                label="Giới tính"
                                            >
                                                <Select
                                                    placeholder="Giới tính"
                                                    value={formData.profile.gender}
                                                    onChange={(value) =>
                                                        setFormData({
                                                            ...formData,
                                                            profile: { ...formData.profile, gender: value },
                                                        })
                                                    }
                                                    disabled={loading}
                                                    className="rounded-lg"
                                                >
                                                    <Option value="male">Nam</Option>
                                                    <Option value="female">Nữ</Option>
                                                    <Option value="other">Khác</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="website"
                                                label="Website"
                                                rules={[
                                                    { type: 'url', message: 'URL không hợp lệ' },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Website"
                                                    value={formData.profile.website}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            profile: { ...formData.profile, website: e.target.value },
                                                        })
                                                    }
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name="bio"
                                                label="Mô tả"
                                                rules={[{ max: 200, message: 'Mô tả không được vượt quá 200 ký tự' }]}
                                            >
                                                <Input.TextArea
                                                    placeholder="Mô tả về bạn (tối đa 200 ký tự)"
                                                    value={formData.profile.bio}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            profile: { ...formData.profile, bio: e.target.value },
                                                        })
                                                    }
                                                    rows={4}
                                                    showCount
                                                    maxLength={200}
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <div className="text-right">
                                        <Tooltip title="Lưu các thay đổi vào hồ sơ">
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                onClick={handleProfileUpdate}
                                                loading={loading}
                                                disabled={loading || uploadingAvatar}
                                                className="bg-indigo-500 hover:bg-indigo-600 rounded-lg"
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Form>
                            </TabPane>
                            <TabPane
                                tab={
                                    <Space>
                                        <LockOutlined />
                                        Đổi mật khẩu
                                    </Space>
                                }
                                key="password"
                            >
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordUpdate}
                                    className="mt-4"
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="currentPassword"
                                                label="Mật khẩu hiện tại"
                                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                            >
                                                <Input.Password
                                                    placeholder="Mật khẩu hiện tại"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            currentPassword: e.target.value,
                                                        })
                                                    }
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="newPassword"
                                                label="Mật khẩu mới"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                                                ]}
                                            >
                                                <Input.Password
                                                    placeholder="Mật khẩu mới"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            newPassword: e.target.value,
                                                        })
                                                    }
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="confirmPassword"
                                                label="Xác nhận mật khẩu mới"
                                                dependencies={['newPassword']}
                                                rules={[
                                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('newPassword') === value) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password
                                                    placeholder="Xác nhận mật khẩu mới"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            confirmPassword: e.target.value,
                                                        })
                                                    }
                                                    disabled={loading}
                                                    className="rounded-lg focus:ring-indigo-500"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <div className="text-right">
                                        <Tooltip title="Cập nhật mật khẩu mới">
                                            <Button
                                                type="primary"
                                                icon={<LockOutlined />}
                                                onClick={handlePasswordUpdate}
                                                loading={loading}
                                                disabled={loading || uploadingAvatar}
                                                className="bg-indigo-500 hover:bg-indigo-600 rounded-lg"
                                            >
                                                Cập nhật mật khẩu
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            <style jsx global>{`
        .ant-input,
        .ant-select-selector,
        .ant-input-password,
        .ant-input-textarea {
          border-radius: 8px !important;
          transition: all 0.3s !important;
        }
        .ant-input:focus,
        .ant-select-selector:focus,
        .ant-input-password:focus,
        .ant-input-textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
        }
        .ant-tabs-nav {
          margin-bottom: 16px !important;
        }
        .ant-tabs-tab {
          padding: 8px 16px !important;
          border-radius: 12px !important;
        }
        .ant-tabs-tab-active {
          background: #e0e7ff !important;
        }
      `}</style>
        </div>
    );
};

export default AccountPage;