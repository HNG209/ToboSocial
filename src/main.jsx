import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import './styles/global.css'
import './index.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import App from "./App";
import ErrorPage from "./pages/error";
import Home from "./pages/Home";
import ExplorePage from "./pages/ExplorePage";
import ReelsPage from "./pages/ReelsPage";
import MessagesPage from "./pages/MessagePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import ChangePassword from "./pages/ChangePassword";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import PostDetailPage from "./pages/client/PostDetailPage";
import SearchPage from "./components/home/SearchBar";
import Profilex from "./pages/client/Profiles";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";




const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // chứa Layout với Sidebar + BottomNav
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/explore",
        element: <ExplorePage />,
      },
      {
        path: "/reels",
        element: <ReelsPage />,
      },
      {
        path: "/messages",
        element: (
          <MessagesPage />
        ),
      },
      {
        path: "/profile",
        element: (
          // <PrivateRoute>
          <ProfilePage />
          // </PrivateRoute>
        ),
      },
      {
        path: "/edit-profile",
        element: (
          // <PrivateRoute>
          <ProfileEditPage />
          // </PrivateRoute>
        ),
      },
      {
        path: "change-password",
        element: (
          // <PrivateRoute>
          <ChangePassword />
          // </PrivateRoute>
        ),
      },
      {
        path: "/posts/:postId",
        element: <PostDetailPage />,
      },
      {
        path: "/search",
        element: <SearchPage />
      },
      {
        path: "/profile/:username",
        element: <Profilex />
      }
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgetpassword",
    element: (<ForgetPasswordPage />)
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "posts",
        element: <div>AdminPosts </div>,
      },
      {
        path: "reports",
        element: <div>AdminReports</div>,
      },
      {
        path: "comments",
        element: <div>AdminComments </div>,
      }
    ]
  }

]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* // <AuthWrapper> */}
    <RouterProvider router={router} />
    {/* // </AuthWrapper> */}
  </Provider>
);
