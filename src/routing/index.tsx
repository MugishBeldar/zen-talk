import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import LoginSignup from "../pages/login-signup";
import Home from "../pages/home";

const MainRouting = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginSignup />,
      errorElement: <><p>not found</p></>,
      children: [
        {
          path: '/home',
          element: <Home />,
        },
      ],
    },
  ]);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default MainRouting;
