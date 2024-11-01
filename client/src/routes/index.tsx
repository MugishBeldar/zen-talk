import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AuthRoot, ChatArea, ChatContainer, Login, Signup } from "@/app";

export const MainRouting = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthRoot />,
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
    {
      path: "/:loggedUserId/chat",
      element: <ChatContainer />, // Main chat container layout
      children: [
        {
          path: "",
          element: (
            <div style={{ display: "flex" }}>
              <div>No chat selected</div>
            </div>
          ),
        },
        {
          path: ":chatId", // Route for individual chat threads
          element: (
            <div style={{ display: "flex" }}>
              {/* <ChatList /> Sidebar with chat list */}
              <ChatArea />
            </div>
          ),
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
