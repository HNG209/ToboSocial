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
import PostManagement from "./pages/admin/PostManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import NotificationPage from "./pages/client/NotificationPage";
import AccountPage from "./pages/admin/AccountPage";
import { ConfigProvider, App as AntdApp } from 'antd';
import AdminRoute from "./pages/client/auth/AdminRoute";
import PrivateRoute from "./pages/client/auth/PrivateRoute";




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
        element: <PrivateRoute><ExplorePage /></PrivateRoute>,
      },
      {
        path: "/reels",
        element: <ReelsPage />,
      },
      {
        path: "/notifications",
        element: <PrivateRoute><NotificationPage /></PrivateRoute>,
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
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/other/:id",
        element: (
          <ProfilePage />
        )
      },
      {
        path: "/edit-profile",
        element: (
          <PrivateRoute>
            <ProfileEditPage />
          </PrivateRoute>
        ),
      },
      {
        path: "change-password",
        element: (
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        ),
      },
      {
        path: "/posts/:postId",
        element: <PostDetailPage />,
      },
      {
        path: "/search",
        element: <PrivateRoute><SearchPage /></PrivateRoute>
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
    element: <AdminRoute><AdminLayout /></AdminRoute>,
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
        element: <PostManagement />,
      },
      {
        path: "reports",
        element: <ReportManagement />,
      },
      {
        path: "account",
        element: <AccountPage />,
      }
    ]
  }

]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <ConfigProvider getPopupContainer={() => document.body}>
    <AntdApp>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </AntdApp>
  </ConfigProvider>
);

