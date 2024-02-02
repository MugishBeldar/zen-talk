/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import useMyChatsContrller from "./myChats.controller";
import { chatType, userType, userTypes } from "../../types";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import ChatList from "../chat-list/chatList";
import ChatArea from "../chat-area/chatArea";

const MyChats = () => {
  const [chatss, setChats] = React.useState<chatType[]>([]);
  const chats = useSelector((state: any) => state.chatState.chats);
  const [clickedUser, setClickedUser] = React.useState<userTypes | null>(null);
  const [selectedChat, setSelectedChat] = React.useState<chatType | null>(null);
  // console.log("🚀 ~ MyChats ~ clickedUser:", clickedUser);
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
    if (user) {
      setClickedUser(user);
      setSelectedChat(firstChat);
    }
  }, [chats]);

  return (
    <div className="flex  border-2 rounded-lg">
      <div className="w-[30%] p-4 border-2 rounded-xl hidden md:block lg:block xl:block 2xl:block">
        <ChatList
          setClickedUserFunction={setClickedUser}
          setSelectedChatFunction={setSelectedChat}
        />
      </div>
      <div className="w-[100%] border-2 rounded-xl bg-white my-4 mr-4 md:flex md:flex-col md:w-[70%]">
        <ChatArea clickedUser={clickedUser} />
      </div>
    </div>
  );
};

export default MyChats;
