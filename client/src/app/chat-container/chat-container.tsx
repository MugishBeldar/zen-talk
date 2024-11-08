// import { useAuth } from "@/hooks";
import { Outlet, useLocation } from "react-router-dom";
import ChatList from "./chat-list/chat-list";
import Sidebar from "../sidebar/sidebar";
const ChatContainer = () => {
  // const isLoggedIn = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate("/login");
  //   }
  // }, [isLoggedIn, navigate]);c

  const chats = [
    { id: "1", userId: "user1", name: "Alice" },
    { id: "2", userId: "user2", name: "Bob" },
    { id: "3", userId: "user3", name: "Charlie" },
    // Add more chats as needed
  ];
  const path = useLocation();

  return (
    <div className="p-[20px] bg-primary-white box-border">
      {/* Chat List (Sidebar) */}
      <div className="flex gap-6 h-[calc(100vh-40px)]">
        <Sidebar />
        {path.pathname.split("/").includes("chat") && (
          <ChatList chats={chats} />
        )}

        {/* Chat Area (Messages) */}
        <div className="flex-1 h-full bg-secondary-white rounded-xl">
          <Outlet /> {/* This renders the child routes for chat area */}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
