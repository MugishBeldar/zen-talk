import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Login, Signup } from "../app";
import { AuthRoot } from "@/app/auth";

export const MainRouting = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthRoot />,
      // loader: rootLoader,
      children: [
        {
          path: "/", // Redirect from root path
          element: <Navigate to="/login" replace />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};
