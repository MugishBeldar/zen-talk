// import { useAuth } from "@/hooks";
import { Outlet, useLocation } from "react-router-dom";
import ChatList from "./chat-list/chat-list";
import Sidebar from "../sidebar/sidebar";
import MobileSideBar from "../mobile-sidebar/mobile-sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { screenSize } from "@/store/screen-sizes/screen-sizes.action";
import { stateType } from "@/types/store";
import { cn } from "@/lib/utils";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const screenSizes = useSelector((state: stateType) => {
    return state.screenSizeState;
  });
  const path = useLocation();
  console.log("\n\n[+]: ChatContainer -> path", path.pathname.split("/"));

  useEffect(() => {
    const smallScreenQuery = window.matchMedia("(max-width: 768px)");
    const largeScreenQuery = window.matchMedia("(min-width: 768px)");

    const handleScreenChange = () => {
      dispatch(
        screenSize({
          largeScreen: largeScreenQuery.matches,
          smallScreen: smallScreenQuery.matches,
        })
      );
    };

    handleScreenChange();

    smallScreenQuery.addEventListener("change", handleScreenChange);
    largeScreenQuery.addEventListener("change", handleScreenChange);

    return () => {
      smallScreenQuery.removeEventListener("change", handleScreenChange);
      largeScreenQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  return (
    <div className="lg:p-[20px] h-screen bg-primary-white box-border">
      {/* Chat List (Sidebar) */}
      <div className="py-3 lg:py-0">
        <MobileSideBar />
        <div
          className={cn(
            // screenSizes.smallScreen && path.pathname.split("/").length === 3
            //   ? "h-[calc(100vh-97px)]"
            //   : null,
           
            "h-[calc(100vh-97px)] flex lg:gap-6 lg:h-[calc(100vh-40px)]"
          )}
        >
          <Sidebar />
          {path.pathname.split("/").includes("chat") && <ChatList />}

          {/* Chat Area (Messages) */}
          <div
            className={cn(
              screenSizes.smallScreen && path.pathname.split("/").length === 4
                ? "ml-3"
                : "hidden",
              "md:block mr-3 lg:mr-0 flex-1 lg:h-full bg-secondary-white shadow-md rounded-xl"
            )}
          >
            <Outlet /> {/* This renders the child routes for chat area */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
