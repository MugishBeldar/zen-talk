import { EllipsisVertical, MessageSquare, Phone, Settings } from "lucide-react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import useMobileSidebarController from "./mobile-sidebar.controller";

const MobileSideBar = () => {
  const path = useLocation();
  const { handleMessages, handleSetting, handleLogOut, handleCallLogs } =
    useMobileSidebarController();
  return (
    <div className="shadow-md lg:hidden flex justify-between items-center py-4 bg-primary-violet rounded-xl mx-3 mb-3">
      <p className="px-4 text-xl text-primary-white ">Zen Talk</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="text-primary-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 mr-3 shadow-md">
          <DropdownMenuLabel className="text-primary-violet">
            Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleMessages}
            className={cn(
              path.pathname.split("/").includes("chat")
                ? "bg-primary-violet text-primary-white"
                : null,
              "focus:bg-primary-violet focus:text-primary-white my-1"
            )}
          >
            <MessageSquare />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              path.pathname.split("/").includes("setting")
                ? "bg-primary-violet text-primary-white"
                : null,
              "focus:bg-primary-violet focus:text-primary-white my-1"
            )}
            onClick={handleSetting}
          >
            <Settings />
            <span>Setting</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              path.pathname.split("/").includes("callLogs")
                ? "bg-primary-violet text-primary-white"
                : null,
              "focus:bg-primary-violet focus:text-primary-white my-1"
            )}
            onClick={handleCallLogs}
          >
            <Phone />
            <span>Call Logs</span>
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="focus:bg-primary-violet focus:text-primary-white">
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem> */}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogOut}
            className="focus:bg-primary-violet focus:text-primary-white"
          >
            <LogOut />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileSideBar;
