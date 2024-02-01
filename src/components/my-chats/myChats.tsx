import React from "react";
import useMyChatsContrller from "./myChats.controller";
import { chatType, userType, userTypes } from "../../types";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Avatar, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from '@mui/icons-material/Send';

const MyChats = () => {
  const [chatss, setChats] = React.useState<chatType[]>([]);
  const chats = useSelector((state: any) => state.chatState.chats);
  const [clickedUser, setClickedUser] = React.useState<userTypes | null>(null);
  console.log("🚀 ~ MyChats ~ clickedUser:", clickedUser);
  const { fetchChats } = useMyChatsContrller({ setChats });
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType =
    userInfoStringify && JSON.parse(userInfoStringify);

  React.useEffect(() => {
    fetchChats();
  }, []);

    React.useEffect(() => {
      const firstChat: chatType = chats && chats[0];
      let user;
      if (firstChat && firstChat.users) {
        user = firstChat.users.find((user) => user._id !== loggedUser.ID);
      }
      if(user)  setClickedUser(user)
  }, [chats]);

  const getSender = (loggedUser: userType, users: userTypes[]) => {
    const senderName =
      users[0]?._id === loggedUser?.ID ? users[1].name : users[0].name;
    return senderName.charAt(0).toUpperCase() + senderName.slice(1);
  };

  const getProfilePicture = (loggedUser: userType, users: userTypes[]) => {
    const selectedUser: userTypes[] = users.filter(
      (user) => user._id !== loggedUser.ID
    );
    return selectedUser[0].profilePic
      ? selectedUser[0].profilePic
      : `https://ui-avatars.com/api/?background=random&name=${selectedUser[0].name}`;
  };

  const getSelectedUser = (loggedUser: userType, users: userTypes[]) => {
    // console.log(loggedUser, "loogedUser");
    // console.log('chating user,', users);
    const selectedUser: userTypes[] = users.filter(
      (user) => user._id !== loggedUser.ID
    );
    setClickedUser(selectedUser[0]);
  };

  return (
    <div className="flex h-auto my-3 border-2 rounded-lg">
      <div className="w-[30%] p-4 border-2 rounded-xl">
        <div className="flex bg-white px-2 py-4 mb-2 border-2 rounded-lg">
          <p className="text-2xl ml-3 w-[65%] text-gray-500">My Chats</p>
          <Button
            sx={{ backgroundColor: "Blue", fontWeight: "bold" }}
            variant="contained"
            size="small"
          >
            Create group <AddIcon className="ml-[2px]" />
          </Button>
        </div>

        <div className="bg-white h-[79vh] border-2 rounded-lg ">
          <ul className="overflow-scroll h-full no-scrollbar">
            {chats &&
              chats.map(
                (chat: chatType) =>
                  chat &&
                  chat.users && (
                    <li
                      onClick={() =>
                        chat.users
                          ? getSelectedUser(loggedUser, chat?.users)
                          : null
                      }
                      key={chat._id}
                      className="h-[6vh] flex items-center mx-2 px-2 hover:bg-blue-100 hover:rounded-lg"
                    >
                      {chat.users && (
                        <Avatar
                          alt="Remy Sharp"
                          src={getProfilePicture(loggedUser, chat.users)}
                          sx={{ marginRight: "20px" }}
                        />
                      )}
                      {!chat.isGroupChat && chat.users
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </li>
                  )
              )}
          </ul>
        </div>
      </div>
      <div className="w-[70%] border-2 rounded-xl bg-white my-4 mr-4 flex flex-col">
        {clickedUser && (
          <div className="flex bg-white p-2 mb-2 border-b-2 rounded-lg">
            <div className="text-2xl ml-3 w-[65%] text-gray-500">
              {clickedUser && (
                <div className="flex items-center">
                  <Avatar
                    alt="Remy Sharp"
                    src={
                      clickedUser.profilePic
                        ? clickedUser.profilePic
                        : `https://ui-avatars.com/api/?background=random&name=${clickedUser.name}`
                    }
                    sx={{ marginRight: "20px", width: "50px", height: "50px" }}
                  />
                  <p>
                    {clickedUser.name.charAt(0).toUpperCase() +
                      clickedUser.name.slice(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1">{/* Messages go here */}
        <h1>messages</h1>
        </div>

        <div className="flex items-center border-t-2">
          <input
            type="text"
            className="flex-1 inline m-2 p-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500  rounded-md sm:text-sm focus:ring-1"
            placeholder="Type your message..."
          />
          
          <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-700">😀 Emoji</button>
         
          <button className="mx-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-700"><SendIcon fontSize="small" className="mr-1 flex items-center mt-[-2px ]"/>Send</button>
        </div>
      </div>
    </div>
  );
};

export default MyChats;
