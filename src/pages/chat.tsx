import AppDrawer from "../components/drawer/drawer";
import Notification from "../components/notification/notification";
import Profile from "../components/profile/profile";
import AppTitle from "../components/title/title";

const Chat = () => {
  return (
    <div className="flex justify-between items-center px-[1%] bg-white mx-5 rounded-md border-2 h-16 sm:flex sm:justify-between sm:items-center">
      <AppDrawer />
      <AppTitle />
      <div className="flex w-[18%] justify-between sm:flex sm:justify-between sm:w-[7%] sm:mr-[1%]">
        <Profile />
        <Notification />
      </div>
    </div>
  );
};

export default Chat;
