import React, { useState } from "react";
import { Button, Form, Input, notification, Spin, Typography, Divider, Alert } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    LockOutlined,
    KeyOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { IoShieldOutline } from "react-icons/io5";
import { updateUserPasswordAPI } from "../services/admin.service";

const { Title, Text, Paragraph } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const checkPasswordStrength = (password) => {
        if (!password) return 0;

        let strength = 0;
        if (password.match(/[a-z]+/)) strength += 1; // Lowercase
        if (password.match(/[A-Z]+/)) strength += 1; // Uppercase
        if (password.match(/[0-9]+/)) strength += 1; // Numbers
        if (password.match(/[$@#&!]+/)) strength += 1; // Special characters
        if (password.length >= 8) strength += 1; // Length

        return strength;
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return "#ff4d4f";
        if (passwordStrength <= 3) return "#faad14";
        return "#52c41a";
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return "Weak";
        if (passwordStrength <= 3) return "Medium";
        return "Strong";
    };

    const handlePasswordChange = (e) => {
        const strength = checkPasswordStrength(e.target.value);
        setPasswordStrength(strength);
    };

    const onFinish = async (values) => {
        if (!user?._id) {
            notification.error({
                message: "Authentication Error",
                description: "User not found. Please log in again.",
                placement: "topRight",
            });
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const data = {
                _id: user._id,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            };
            console.log("Sending password update request:", data); // Debug payload
            const response = await updateUserPasswordAPI(data);
            console.log("API Response:", response); // Debug response

            if (response === undefined || response === null) {
                notification.success({
                    message: "Password Updated",
                    description: "Your password has been successfully updated.",
                    placement: "topRight",
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                });
                form.resetFields();
                setPasswordStrength(0);
                navigate("/login"); // Chuyển hướng về login
            } else if (typeof response === "object" && response.errorCode !== undefined) {
                if (response.errorCode === 0) {
                    notification.success({
                        message: "Password Updated",
                        description: "Your password has been successfully updated.",
                        placement: "topRight",
                        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                    });
                    form.resetFields();
                    setPasswordStrength(0);
                    navigate("/login"); // Chuyển hướng về login
                } else {
                    throw new Error(response.message || "Failed to update password");
                }
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Password update error:", error); // Debug lỗi
            const errorMessage = typeof error === "object" && error.message ? error.message : "Failed to update password. Please try again.";
            notification.error({
                message: "Update Failed",
                description:
                    errorMessage === "Current password is incorrect"
                        ? "The current password you entered is incorrect."
                        : errorMessage === "User not found"
                            ? "User account not found. Please log in again."
                            : errorMessage,
                placement: "topRight",
            });
            if (errorMessage === "User not found") {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                    <IoShieldOutline style={{ fontSize: 36, color: "#1890ff", marginRight: 12 }} />
                    <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                        Change Password
                    </Title>
                </div>

                <Paragraph className="text-gray-500 text-center mb-6">
                    Create a strong password to keep your account secure
                </Paragraph>

                <Divider />

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
                >
                    <Form.Item
                        label={<Text strong>Current Password</Text>}
                        name="currentPassword"
                        rules={[{ required: true, message: "Please enter your current password" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" style={{ color: "#bfbfbf" }} />}
                            placeholder="Enter current password"
                            size="large"
                            className="rounded-lg"
                            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Divider dashed className="my-4" />

                    <Form.Item
                        label={<Text strong>New Password</Text>}
                        name="newPassword"
                        rules={[
                            { required: true, message: "Please enter your new password" },
                            { min: 6, message: "Password must be at least 6 characters" },
                        ]}
                        help={
                            form.getFieldValue("newPassword") ? (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <Text>Password strength:</Text>
                                        <Text style={{ color: getPasswordStrengthColor() }}>
                                            {getPasswordStrengthText()}
                                        </Text>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(passwordStrength / 5) * 100}%`,
                                                backgroundColor: getPasswordStrengthColor(),
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ) : null
                        }
                    >
                        <Input.Password
                            prefix={<KeyOutlined className="site-form-item-icon" style={{ color: "#bfbfbf" }} />}
                            placeholder="Enter new password"
                            size="large"
                            className="rounded-lg"
                            onChange={handlePasswordChange}
                            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Confirm New Password</Text>}
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Please confirm your new password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<KeyOutlined className="site-form-item-icon" style={{ color: "#bfbfbf" }} />}
                            placeholder="Confirm new password"
                            size="large"
                            className="rounded-lg"
                            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    {passwordStrength >= 4 && (
                        <Alert
                            message="Strong password"
                            description="Your password is secure and meets all requirements."
                            type="success"
                            showIcon
                            className="mb-4"
                        />
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700 h-12 rounded-lg font-semibold text-base"
                            disabled={loading}
                        >
                            {loading ? <Spin size="small" /> : "Update Password"}
                        </Button>
                    </Form.Item>
                </Form>

                <Button
                    onClick={() => navigate(-1)}
                    className="w-full mt-4 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-lg h-12 flex items-center justify-center"
                    size="large"
                    icon={<ArrowLeftOutlined />}
                >
                    Back to Profile
                </Button>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <Paragraph className="text-gray-500 text-sm text-center">
                        For security reasons, you'll be asked to log in again after changing your password.
                    </Paragraph>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;