import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { MessageSquare, Bell, Settings, LogOut } from "lucide-react";
import useSidebarController from "./sidebar-controller";
import { stateType } from "../auth/auth-root";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const { handleLogOut } = useSidebarController();
  const user = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });
  console.log("user:---", user);
  return (
    <div className="flex flex-col justify-between w-20 bg-primary-violet p-4 rounded-xl">
      {/* Top Icons */}
      <div className="flex flex-col space-y-10 items-center">
        <Avatar>
          <AvatarImage
            src={
              user?.profilePic
                ? user.profilePic
                :`https://ui-avatars.com/api/?name=${user?.name}&background=eff6fc&color=7c3aed`
            }
            alt="@shadcn"
            className="rounded-full cursor-pointer"
          />
        </Avatar>
        <MessageSquare
          className="text-primary-white cursor-pointer hover:text-secondary-white "
          size={32}
        />
        <Bell
          className="text-primary-white cursor-pointer hover:text-secondary-white "
          size={32}
        />
        <Settings
          className="text-primary-white cursor-pointer hover:text-secondary-white "
          size={32}
        />
      </div>

      {/* Bottom Icon */}
      <div className="flex flex-col items-center">
        <LogOut
          onClick={handleLogOut}
          className="text-primary-white cursor-pointer hover:text-secondary-white "
          size={32}
        />
      </div>
    </div>
  );
};

export default Sidebar;
