import SearchUser from "../components/search-user/search";
import Notification from "../components/notification/notification";
import Profile from "../components/profile/profile";
import AppTitle from "../components/title/title";

const Chat = () => {
  return (
    <div className="flex justify-between items-center px-[1%] bg-white rounded-md border-2 h-16 sm:flex sm:justify-between sm:items-center">
      <SearchUser />
      <AppTitle />
      <div className="flex w-[18%] justify-between sm:flex sm:justify-between sm:w-[13%] sm:mr-[1%] md:w-[10%] lg:w-[7%] md:mr-5">
        <Profile />
        <Notification />
      </div>
    </div>
  );
};

export default Chat;
