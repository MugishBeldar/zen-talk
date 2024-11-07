import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { AuthRoot, ChatArea, ChatContainer, Login, Signup } from "@/app";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

const checkAuth = () => {
  const tokens = Cookies.get("TOKEN");
  if (!tokens) {
    throw redirect("/login");
  }
  return null;
};

const socket = io("http://localhost:5000");

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
      path: "/:userId/chat",
      element: <ChatContainer />,
      loader: checkAuth,
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
          path: ":chatId",
          element: (
            <div className="h-full">
              {/* <ChatList /> Sidebar with chat list */}
              <ChatArea socket={socket} />
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

// import {
//   createBrowserRouter,
//   Navigate,
//   RouterProvider,
// } from "react-router-dom";
// import { AuthRoot, ChatArea, ChatContainer, Login, Signup } from "@/app";

// export const MainRouting = () => {
//   const router = createBrowserRouter([
//     {
//       path: "/",
//       element: <AuthRoot />,
//       children: [
//         {
//           path: "/", // Redirect from root path
//           element: <Navigate to="/login" replace />,
//         },
//         {
//           path: "login",
//           element: <Login />,
//         },
//         {
//           path: "signup",
//           element: <Signup />,
//         },
//       ],
//     },
//     {
//       path: "/:loggedUserId/chat",
//       element: <ChatContainer />, // Main chat container layout
//       children: [
//         {
//           path: "",
//           element: (
//             <div style={{ display: "flex" }}>
//               <div>No chat selected</div>
//             </div>
//           ),
//         },
//         {
//           path: ":chatId", // Route for individual chat threads
//           element: (
//             <div style={{ display: "flex" }}>
//               {/* <ChatList /> Sidebar with chat list */}
//               <ChatArea />
//             </div>
//           ),
//         },
//       ],
//     },
//   ]);

//   return (
//     <>
//       <RouterProvider router={router} />
//     </>
//   );
// };
