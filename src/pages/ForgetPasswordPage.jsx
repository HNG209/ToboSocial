import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgetPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã, 3: Đổi mật khẩu
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState(""); // Mã xác nhận giả lập
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // B1: Gửi mã xác nhận
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Vui lòng nhập email.");
      setIsLoading(false);
      return;
    }

    try {
      // Gọi mock API để kiểm tra email có tồn tại không
      const res = await axios.get("https://67da34cd35c87309f52b67a2.mockapi.io/user");
      const users = res.data;
      const userExists = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!userExists) {
        setError("Email không tồn tại trong hệ thống.");
      } else {
        const fakeCode = Math.floor(100000 + Math.random() * 900000).toString(); // Mã giả lập 6 chữ số
        setGeneratedCode(fakeCode);
        setMessage(`Mã xác nhận đã được gửi đến email của bạn. (${fakeCode})`);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      
      setError("Đã xảy ra lỗi khi kiểm tra email.");
    } finally {
      setIsLoading(false);
    }
  };

  // B2: Xác minh mã
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!verificationCode) {
      setError("Vui lòng nhập mã xác nhận.");
      return;
    }

    if (verificationCode === generatedCode) {
      setMessage("Xác minh thành công. Vui lòng nhập mật khẩu mới.");
      setStep(3);
    } else {
      setError("Mã xác nhận không chính xác.");
    }
  };

  // B3: Đổi mật khẩu (giả lập)
  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }
  
    setIsLoading(true);
    setError("");
    setMessage("");
  
    try {
      // 1. Tìm user theo email
      const userRes = await axios.get(`https://67da34cd35c87309f52b67a2.mockapi.io/user?email=${email}`);
      const user = userRes.data[0];
  
      if (!user) {
        setError("Không tìm thấy người dùng với email này.");
        setIsLoading(false);
        return;
      }
  
      // 2. Gửi PUT để cập nhật mật khẩu
      await axios.put(`https://67da34cd35c87309f52b67a2.mockapi.io/user/${user.id}`, {
        ...user,
        password: newPassword,
      });
  
      setMessage("Mật khẩu đã được thay đổi thành công.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi thay đổi mật khẩu.");
    }
  
    setIsLoading(false);
  };
  

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {message && <div className="text-green-500 text-center mb-4">{message}</div>}

      {/* Bước 1: Nhập email */}
      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isLoading ? "Đang kiểm tra..." : "Gửi mã xác nhận"}
          </button>
        </form>
      )}

      {/* Bước 2: Nhập mã xác nhận */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Nhập mã xác nhận"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Xác nhận mã
          </button>
        </form>
      )}

      {/* Bước 3: Nhập mật khẩu mới */}
      {step === 3 && (
        <form onSubmit={handleSubmitNewPassword}>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Đổi mật khẩu
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgetPasswordPage;
