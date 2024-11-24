import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from "react-router-dom";
import {
  AuthRoot,
  ChatArea,
  ChatContainer,
  Login,
  NoChatSelected,
  Setting,
  // Setting,
  Signup,
} from "@/app";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
// import {SOCKET_API_ENDPOINT} from "@/utils/enum.ts";

const checkAuth = () => {
  const tokens = Cookies.get("TOKEN");
  if (!tokens) {
    throw redirect("/login");
  }
  return null;
};
//
// const socket = io("http://localhost:5000", {
//   transports: ["polling"], // Use polling transport
// });
const socket = io('https://zen-talk-server.onrender.com',{
transports: ["polling"], // Use polling transport
});

export const MainRouting = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthRoot />,
      children: [
        {
          path: "/",
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
      path: "/:userId",
      element: <ChatContainer />,
      loader: checkAuth,
      children: [
        {
          path: "chat",
          element: <NoChatSelected />,
        },
        {
          path: "chat/:chatId",
          element: (
            <div className="h-full">
              <ChatArea socket={socket} />
            </div>
          ),
        },
        {
          path: "setting",
          element: (
            <div className="h-full">
              <Setting />
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
