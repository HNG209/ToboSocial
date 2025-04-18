import React, { createContext, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// Context definitions
const UserIdContext = createContext();
const SetUserIdContext = createContext();

// Custom hooks to use the contexts
const useUserId = () => {
  const context = useContext(UserIdContext);
  if (!context) {
    throw new Error("useUserId must be used within a UserIdProvider");
  }
  return context;
};

const useSetUserId = () => {
  const context = useContext(SetUserIdContext);
  if (!context) {
    throw new Error("useSetUserId must be used within a SetUserIdProvider");
  }
  return context;
};

// ProfileProvider component
function ProfileProvider({ children }) {
  const userData = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [userId, setUserId] = useState(userData);

  return (
    <UserIdContext.Provider value={userId}>
      <SetUserIdContext.Provider value={setUserId}>
        {children}
      </SetUserIdContext.Provider>
    </UserIdContext.Provider>
  );
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // State để hiển thị Modal notification
  const [showModal, setShowModal] = useState(false); // Kiểm soát việc hiển thị Modal

  const setUserId = useSetUserId();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setModalMessage("Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu");
      setShowModal(true);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch users from the API
      const response = await fetch("https://67da34cd35c87309f52b67a2.mockapi.io/user");
      const users = await response.json();

      // Find user by username
      const user = users.find((u) => u.username === formData.username);

      if (user) {
        if (user.password === formData.password) {
          // Store userId in localStorage and set user context
          localStorage.setItem("userId", user.id);
          setUserId(user.id);

          setModalMessage("Đăng nhập thành công!");
          setShowModal(true);

          // Redirect to Home after success
          setTimeout(() => {
            navigate("/"); // Redirect to Home page
          }, 1500);
        } else {
          setModalMessage("Mật khẩu không chính xác");
          setShowModal(true);
        }
      } else {
        setModalMessage("Tài khoản không tồn tại");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setModalMessage("Có lỗi xảy ra. Vui lòng thử lại");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle close Modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-cyan-400">
      <div className="w-full max-w-md p-8 mx-auto bg-white rounded-3xl shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-blue-600">Sign In</h1>

        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
            disabled={isLoading}
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an Account?
          </Link>
        </div>
      </div>

      {showModal && (
  <div className="fixed inset-0 flex justify-center items-center z-50">
    {/* Dark overlay backdrop */}
    <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>
    
    {/* Modal container with improved styling */}
    <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-96 border-2 border-blue-200 transform transition-all duration-300 scale-100 animate-fadeIn">
      {/* Optional icon for visual emphasis */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      {/* Message with improved typography */}
      <p className="text-center text-lg font-medium mb-6">{modalMessage}</p>
      
      {/* Button with improved styling */}
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

// Wrap the entire App in ProfileProvider for context access
function App() {
  return (
    <ProfileProvider>
      <LoginPage />
    </ProfileProvider>
  );
}

export default App;
