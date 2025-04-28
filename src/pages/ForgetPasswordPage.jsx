import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../redux/auth/authSlice";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // Track if email was sent successfully
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

  // Handle sending forgot password request
  const handleSendEmail = async (e) => {
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
      // Call forgotPassword API via Redux thunk
      await dispatch(forgotPassword(email)).unwrap();

      // On success, show success message and enable "Back to Login" button
      setMessage("Mật khẩu mới đã được gửi thành công đến email của bạn.");
      setEmailSent(true);
    } catch (err) {
      // Handle error (e.g., email not found)
      setError(
        err.message.includes("not found") || err.message.includes("Email không tồn tại")
          ? "Email không tồn tại trong hệ thống."
          : "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate back to login page
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {message && <div className="text-green-500 text-center mb-4">{message}</div>}

      <form onSubmit={handleSendEmail}>
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
          disabled={isLoading || authStatus === "loading"}
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {isLoading || authStatus === "loading" ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>

      {emailSent && (
        <button
          onClick={handleBackToLogin}
          className="w-full p-3 mt-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Quay về trang đăng nhập
        </button>
      )}
    </div>
  );
};

export default ForgetPasswordPage;