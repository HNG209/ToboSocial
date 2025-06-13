import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import ToBoSocialImage from '../assets/tobosocial.png';
import { login } from '../redux/auth/authSlice';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalMessage('');

    if (!formData.username || !formData.password) {
      setModalMessage('Vui lòng nhập đầy đủ username và mật khẩu');
      setShowModal(true);
      return;
    }

    try {
      const result = await dispatch(
        login({ username: formData.username, password: formData.password })
      ).unwrap();

      const userRole = user?.role || result?.role || 'user';
      if (userRole === 'banned') {
        setModalMessage('Tài khoản bị khóa, không thể đăng nhập.');
        setShowModal(true);
        return;
      }
      setModalMessage('Đăng nhập thành công!');
      setShowModal(true);
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin'); // Redirect đến trang admin
        } else {
          navigate('/'); // Redirect đến trang chính
        }
      }, 1500);
    } catch (err) {
      setModalMessage(err || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setShowModal(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-400 to-blue-600">
      <div className="flex w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="hidden md:block w-1/2">
          <img
            src={ToBoSocialImage}
            alt="ToboSocial"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
          <h1 className="mb-6 text-2xl font-bold text-center text-blue-600">
            Sign In
          </h1>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
            <div className="space-y-2">
              <input
                type="text"
                name="username"
                placeholder="username or email"
                // value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {status === 'loading' ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgetpassword" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <Link to="/register" className="text-blue-600 hover:underline">
              Create an Account?
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-96 border-2 border-blue-200 transform transition-all duration-300 scale-100 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-center text-lg font-medium mb-6">{modalMessage}</p>
            <button
              onClick={handleCloseModal}
              className="mt-4 w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;