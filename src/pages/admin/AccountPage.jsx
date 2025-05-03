import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Avatar, Select, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { getCurrentUserAPI, updateUserProfileAPI, updateUserPasswordAPI } from '../../services/admin.service';
import axios from 'axios';

const { Option } = Select;

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
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
            gender: 'other'
        }
    });
    const [passwordData, setPasswordData] = useState({
        _id: '',
        currentPassword: '',
        newPassword: ''
    });

    // Cloudinary config
    const CLOUDINARY_UPLOAD_PRESET = 'testUploadImage'; // Thay bằng upload preset thực tế
    const CLOUDINARY_CLOUD_NAME = 'dai4ctigv'; // Đúng với cloud name bạn cung cấp

    // Lấy thông tin người dùng khi tải trang
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await getCurrentUserAPI();
                const userData = response; // Vì axios.customize đã xử lý response.data.result
                setUser(userData);
                setFormData({
                    _id: userData._id,
                    username: userData.username,
                    email: userData.email,
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    profile: {
                        bio: userData.profile?.bio || '',
                        website: userData.profile?.website || '',
                        avatar: userData.profile?.avatar || '',
                        gender: userData.profile?.gender || 'other'
                    }
                });
                setPasswordData(prev => ({
                    ...prev,
                    _id: userData._id
                }));
            } catch (err) {
                message.error(err.message || 'Failed to load user data');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Xử lý cập nhật hồ sơ
    const handleProfileUpdate = async () => {
        setLoading(true);
        try {
            const response = await updateUserProfileAPI(formData);
            setUser(response);
            message.success('Profile updated successfully');
        } catch (err) {
            message.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý cập nhật mật khẩu
    const handlePasswordUpdate = async () => {
        setLoading(true);
        try {
            await updateUserPasswordAPI(passwordData);
            message.success('Password updated successfully');
            setPasswordData({ _id: user?._id, currentPassword: '', newPassword: '' });
        } catch (err) {
            message.error(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý upload avatar lên Cloudinary
    const handleAvatarUpload = async ({ file }) => {
        setLoading(true);
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
                profile: { ...prev.profile, avatar: avatarUrl }
            }));
            setUser((prev) => ({
                ...prev,
                profile: { ...prev.profile, avatar: avatarUrl }
            }));
            message.success('Avatar uploaded successfully');
        } catch (err) {
            message.error(err.message || 'Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px' }}>Account Settings</h1>

            <Row gutter={[24, 24]}>
                {/* Left profile card */}
                <Col xs={24} md={8}>
                    <Card
                        className="account-card"
                        bordered={false}
                        style={{
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Avatar
                            size={120}
                            src={formData.profile.avatar}
                            icon={<UserOutlined />}
                            style={{ marginBottom: 16 }}
                        />
                        <h2>{formData.fullName || formData.username}</h2>
                        <p style={{ color: '#666' }}>{formData.profile.bio || 'No bio yet'}</p>
                        {formData.profile.website && (
                            <p>
                                <a href={formData.profile.website} target="_blank" rel="noopener noreferrer">
                                    {formData.profile.website}
                                </a>
                            </p>
                        )}
                        <Upload
                            customRequest={handleAvatarUpload}
                            showUploadList={false}
                            accept="image/*"
                            disabled={loading}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={loading}
                                style={{ marginTop: 16 }}
                            >
                                Change Avatar
                            </Button>
                        </Upload>
                    </Card>
                </Col>

                {/* Right profile form */}
                <Col xs={24} md={16}>
                    <Card
                        title="Profile Information"
                        bordered={false}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                        <p style={{ marginBottom: 16 }}>Edit your personal information</p>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Input
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={12}>
                                <Input
                                    placeholder="Full name"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={12}>
                                <Input
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={12}>
                                <Input
                                    placeholder="Phone number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={12}>
                                <Select
                                    placeholder="Gender"
                                    value={formData.profile.gender}
                                    onChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            profile: { ...formData.profile, gender: value }
                                        })
                                    }
                                    style={{ width: '100%' }}
                                    disabled={loading}
                                >
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Col>
                            <Col span={12}>
                                <Input
                                    placeholder="Website"
                                    value={formData.profile.website}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            profile: { ...formData.profile, website: e.target.value }
                                        })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={24}>
                                <Input.TextArea
                                    placeholder="Bio"
                                    value={formData.profile.bio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            profile: { ...formData.profile, bio: e.target.value }
                                        })
                                    }
                                    rows={4}
                                    disabled={loading}
                                />
                            </Col>
                        </Row>
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <Button
                                type="primary"
                                onClick={handleProfileUpdate}
                                loading={loading}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Password change section */}
            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card
                        title="Change Password"
                        bordered={false}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                        <p style={{ marginBottom: 16 }}>Update your password</p>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Input.Password
                                    placeholder="Current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value
                                        })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                            <Col span={12}>
                                <Input.Password
                                    placeholder="New password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })
                                    }
                                    disabled={loading}
                                />
                            </Col>
                        </Row>
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <Button
                                type="primary"
                                onClick={handlePasswordUpdate}
                                loading={loading}
                                disabled={loading}
                            >
                                Update Password
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AccountPage;