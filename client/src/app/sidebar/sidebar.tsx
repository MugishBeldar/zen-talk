import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { MessageSquare, Settings, LogOut } from "lucide-react";
import useSidebarController from "./sidebar-controller";
import { useSelector } from "react-redux";
import { stateType } from "@/types/store";
import { bufferToBase64 } from "@/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

const Sidebar = () => {
  const { handleLogOut } = useSidebarController();
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );
  const path = useLocation();
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex flex-col justify-between items-center w-20 bg-primary-violet rounded-xl">
      {/* Top Icons */}
      <div className=" flex flex-col items-center gap-4 w-full">
        <div className="p-4 w-full  flex justify-center items-center">
          <Avatar className="w-12 h-12 flex flex-1 justify-center items-center ">
            <AvatarImage
              src={
                user?.profilePic?.type === "Buffer"
                  ? bufferToBase64(user.profilePic)
                  : `https://ui-avatars.com/api/?name=${user?.name}&background=eff6fc&color=7c3aed`
              }
              alt="@shadcn"
              className="rounded-full w-full h-full"
            />
          </Avatar>
        </div>
        <div
          onClick={() => {
            const lastChat = Cookies.get("LAST_CHAT");
            if (lastChat) {
              const { reciverUserId, chatId } = JSON.parse(lastChat);
              navigate(`/${reciverUserId}/chat/${chatId}`);
            } else {
              navigate("/");
            }
          }}
          className={cn(
            path.pathname.split("/").includes("chat") ? "bg-black/10" : "",
            "py-4 w-full  flex justify-center items-center hover:bg-black/10"
          )}
        >
          <MessageSquare
            className=" text-primary-white cursor-pointer hover:text-secondary-white"
            size={26}
          />
        </div>
        {/* <div className="py-4 w-full  flex justify-center items-center  hover:bg-black/10">
            <Bell
              className="text-primary-white cursor-pointer hover:text-secondary-white"
              size={26}
            />
          </div> */}
        <div
          className={cn(
            path.pathname.split("/").includes("setting") ? "bg-black/10" : "",
            "py-4 w-full flex justify-center items-center hover:bg-black/10"
          )}
          onClick={() => {
            navigate(`/${user?.id}/setting`);
          }}
        >
          <Settings
            className="text-primary-white cursor-pointer hover:text-secondary-white"
            size={26}
          />
        </div>
      </div>

      {/* Bottom Icon */}
      <div className="py-4 w-full flex justify-center items-center hover:bg-black/10">
        <LogOut
          onClick={handleLogOut}
          className="text-primary-white cursor-pointer hover:text-secondary-white"
          size={26}
        />
      </div>
    </div>
  );
};

export default Sidebar;
