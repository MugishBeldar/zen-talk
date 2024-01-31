import React from "react";
import useMyChatsContrller from "./myChats.controller";
import { chatType, userType, userTypes } from "../../types";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

const MyChats = () => {
  const [chatss, setChats] = React.useState<chatType[]>([]);
  const chats = useSelector((state: any) => state.chatState.chats);
  console.log("🚀 ~ MyChats ~ chats:", chats);
  const { fetchChats } = useMyChatsContrller({ setChats });
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType =
    userInfoStringify && JSON.parse(userInfoStringify);

  React.useEffect(() => {
    fetchChats();
  }, []);

  const getSender = (loggedUser: userType, users: userTypes[]) => {
    return users[0]?._id === loggedUser?.ID ? users[1].name : users[0].name;
  };
  return (
    <div>
      <h1>My Chats</h1>
      <ul>
        
        {chats &&
          chats.map((chat: chatType) => (
            <li key={chat._id}>
              {!chat.isGroupChat && chat.users
                ? getSender(loggedUser, chat.users) 
                : chat.chatName}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MyChats;