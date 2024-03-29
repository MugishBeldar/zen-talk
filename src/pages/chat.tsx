import AppTitle from "../components/title/title";
import Profile from "../components/profile/profile";
import MyChats from "../components/my-chats/myChats";
import SearchUser from "../components/search-user/search";

const Chat = () => {
  return (
    <div>
      <div className="flex justify-between items-center px-[1%] bg-[whitesmoke] rounded-md border-2 h-16 sm:flex sm:justify-between sm:items-center">
        <SearchUser />
        <AppTitle />
        <div className="flex w-[18%] justify-between sm:flex sm:justify-evenly sm:items-center sm:w-[13%] sm:mr-[1%] md:w-[10%] lg:w-[4%]">
          {/* <Notification /> */}
          <Profile />
        </div>
      </div>
      <div className="h-[89vh]">
        <MyChats />
      </div>
    </div>
  );
};

export default Chat;
