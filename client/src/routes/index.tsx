import { lazy, Suspense } from "react";
const ChatContainer = lazy(() => import("@/app/chat-container/chat-container"));
const ChatArea = lazy(() => import("@/app/chat-container/chat-area/chat-area"));
import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from "react-router-dom";
import {
  AuthRoot,
  Login,
  NoChatSelected,
  Setting,
  Signup,
} from "@/app";
// Lazy load components
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { SOCKET_API_ENDPOINT } from "@/utils/enum";
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
const socket = io(SOCKET_API_ENDPOINT, {
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
      element: (
        <Suspense>
          <ChatContainer socket={socket} />
        </Suspense>
      ),
      loader: checkAuth,
      children: [
        {
          path: "chat",
          element: <NoChatSelected />,
        },
        {
          path: "chat/:chatId",
          element: (
            <Suspense>
              <div className="h-full">
                <ChatArea socket={socket} />
              </div>
            </Suspense>
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
