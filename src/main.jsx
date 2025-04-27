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
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  // <AuthWrapper>
  <RouterProvider router={router} />
  // </AuthWrapper>
);
