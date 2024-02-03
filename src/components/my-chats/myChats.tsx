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
  console.log("🚀 ~ MyChats ~ selectedChat:", selectedChat)
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
    if (user) {
      setClickedUser(user);
      setSelectedChat(firstChat);
    }
  }, [chats]);

  return (

    <div className="flex h-full">
      {/* ChatList - Hidden on Small Screens */}
      <div className="hidden w-[35%] sm:flex md:flex lg:flex xl:flex ">
        <ChatList
          setClickedUserFunction={setClickedUser}
          setSelectedChatFunction={setSelectedChat}
        />
      </div>

      {/* ChatArea - Full Width on Small Screens, Flex for Medium and larger screens */}
      <div className="flex-1 mx-2 mt-5 flex flex-col bg-[#e4e4e4]  rounded-lg">
        <ChatArea clickedUser={clickedUser} selectedChat={selectedChat} />
      </div>
    </div>
  );
};

export default MyChats;
