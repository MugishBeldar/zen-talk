/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import useMyChatsContrller from "./myChats.controller";
import { chatType, userType, userMessagesType, userTypes } from "../../types";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import ChatList from "../chat-list/chatList";
import ChatArea from "../chat-area/chatArea";
import Drawer from "../drawer/drawer";


const MyChats = () => {
  const [chatss, setChats] = React.useState<chatType[]>([]);
  const chats = useSelector((state: any) => state.chatState.chats);
  const drawer = useSelector((state: any) => state.drawerState.drawer)
  console.log("🚀 ~ MyChats ~ drawer:", drawer)
  const [clickedUser, setClickedUser] = React.useState<userTypes | null>(null);
  const [selectedChat, setSelectedChat] = React.useState<chatType | null>(null);

  const [chatMaintain, setChatMaintain] = React.useState<boolean>(false);
  // console.log("🚀 ~ MyChats ~ chatMaintain:", chatMaintain)
  const [userMessages, setUserMessages] = React.useState<userMessagesType[] | null>(null);
  // const [drawer, setDrawer] = React.useState<boolean>(true);

  // console.log("🚀 ~ MyChats ~ userMessages:", userMessages);

  const { fetchChats, } = useMyChatsContrller({ setChats, setSelectedChat });
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType = userInfoStringify && JSON.parse(userInfoStringify);

  React.useEffect(() => {
    setClickedUser(null);
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

    <div className="flex h-full relative">
      {/* ChatList - Hidden on Small Screens */}
      <div className="hidden w-[35%] sm:flex md:flex lg:flex xl:flex ">
        <ChatList
          setClickedUserFunction={setClickedUser}
          setSelectedChatFunction={setSelectedChat}
          clickedUser={clickedUser}
          chatMaintain={chatMaintain}
          selectedChat={selectedChat}
        />
      </div>

      {/* <div className="flex absolute w-1/2 h-full top-5 ml-[-10px] sm:hidden" onClick={handleDrawer}>
        <div className="w-full">{
          drawer && <h1>drawer open</h1>
        }</div>
        <div>{drawer ? <img src={rightArrow} alt="Drawer" className="rounded-r-lg w-6" /> : <img src={leftArrow} alt="Drawer" className="rounded-r-lg w-6" />}</div>
      </div> */}

      {/* ChatArea - Full Width on Small Screens, Flex for Medium and larger screens */}
      <div className={`ml-[-10px] absolute mt-5 sm:hidden ${drawer ? "w-2/3 bg-[whitesmoke] shadow-lg" : null}`}>
        <Drawer chatList={<ChatList
          setClickedUserFunction={setClickedUser}
          setSelectedChatFunction={setSelectedChat}
          clickedUser={clickedUser}
          chatMaintain={chatMaintain}
          selectedChat={selectedChat}
        />} />
      </div>
      <div className="flex-1 mx-2 mt-5 flex flex-col bg-[whitesmoke] rounded-lg">
        <ChatArea clickedUser={clickedUser} selectedChat={selectedChat} setChatMaintain={setChatMaintain} chatMaintain={chatMaintain} userMessages={userMessages} setUserMessages={setUserMessages} />
      </div>
    </div>
  );
};

export default MyChats;
