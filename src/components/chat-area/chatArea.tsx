/* eslint-disable react-hooks/exhaustive-deps */
import Cookies from "js-cookie";
import io from "socket.io-client";
import SendIcon from "@mui/icons-material/Send";
import ScrollableFeed from "react-scrollable-feed";
import React, { KeyboardEvent, useEffect, useState } from "react";

import noMessage from "../../assets/noMessage.png";
import chatArea from "../../assets/chatareaImage.png";
import { getUserMessages, sendMessage } from "../../api/api";
import { chatType, userMessagesType, userType, userTypes } from "../../types";
// import Emoji from "../emoji/emoji";

const ENDPOINT: string = "https://zen-talk-server.onrender.com";
var socket: any;

interface ChatAreaProps {
  clickedUser: userTypes | null;
  selectedChat: chatType | null;
  setChatMaintain: React.Dispatch<React.SetStateAction<boolean>>;
  chatMaintain: boolean;
  userMessages: userMessagesType[] | null;
  setUserMessages: React.Dispatch<React.SetStateAction<userMessagesType[] | null>>;
}


const ChatArea = ({ clickedUser, selectedChat, setChatMaintain, chatMaintain, setUserMessages, userMessages }: ChatAreaProps) => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const userInfo: userType = userInfoStringify && JSON.parse(userInfoStringify);

  const renderUserInfo = (clickedUser: userTypes) => (
    <div className="flex items-center ">
      <img
        alt="Remy Sharp"
        src={
          clickedUser.profilePic
            ? clickedUser.profilePic
            : `https://ui-avatars.com/api/?background=random&color=fff&name=${clickedUser.name}`
        }
        className="w-16 h-16 mr-3 rounded-full"
      />
      <p>
        {clickedUser.name.charAt(0).toUpperCase() + clickedUser.name.slice(1)}
      </p>
    </div>
  );

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', userInfo);
    socket.on('connected', () => {
      console.log('Connected to socket.io');
    });
  }, []);

  useEffect(() => {
    if (clickedUser) {
      fetchUserChats();
      socket.emit('joinChat', selectedChat?._id);
    }
  }, [clickedUser, selectedChat]);

  useEffect(() => {
    socket.on('recived', (response: any) => {
      console.log(response, "received message");
      fetchUserChats();
    });
  });

  const fetchUserChats = async () => {
    if (selectedChat) {
      const response = await getUserMessages(selectedChat?._id);
      mapUserMessages(response?.data?.data);
    }
  };

  const mapUserMessages = (data: userMessagesType[]) => {
    let day: string = "";
    const mapedData = data.map((message: userMessagesType) => {
      if (day !== message.createdAt.split(" ")[0]) {
        day = message.createdAt.split(" ")[0];
        message.day = true;
        return message;
      }
      message.day = false;
      return message;
    });
    setUserMessages(mapedData);
  };


  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setCurrentMessage(e.currentTarget.value);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      if (currentMessage && selectedChat?._id) {
        await sendMessage({
          content: currentMessage,
          chatId: selectedChat?._id,
        }, socket);
      }
      setCurrentMessage("");
      fetchUserChats();
      setChatMaintain(!chatMaintain);
    }
  };

  const handleSend = async () => {
    if (currentMessage && selectedChat?._id) {
      console.log('send socket', socket.id);
      await sendMessage({
        content: currentMessage,
        chatId: selectedChat?._id,
      }, socket);
      setCurrentMessage("");
      fetchUserChats();
    }
  };

  return (
    <>
      {clickedUser && (
        <div className="flex bg-[whitesmoke] p-1 mt-2 border-b-2 border-mainBackgroundColor rounded">
          <div className="text-2xl ml-3 w-[65%]">
            {renderUserInfo(clickedUser)}
          </div>
        </div>
      )}

      {!clickedUser && (
        <div className=" bg-[whitesmoke] p-1 my-4 border-b-2 rounded-lg">
          <div>
            <p className="uppercase text-center text-2xl">
              Chose a conversation on the left to start chatting
            </p>
          </div>
        </div>
      )}

      <div className="h-[84%] flex flex-col">
        <div className="flex-grow h-full p-4 mb-2 ">
          <ScrollableFeed className="custom-scrollbar h-full">
            {clickedUser && !userMessages?.length && (
              <div className="h-full flex items-center justify-center">
                <img
                  src={noMessage}
                  alt="no chat found"
                  className="object-fill "
                />
              </div>
            )}
            {!clickedUser && !userMessages?.length && (
              <div className="h-full flex items-center justify-center">
                <img
                  src={chatArea}
                  alt="no chat found"
                  className="object-fill "
                />
              </div>
            )}
            {userMessages &&
              userMessages.map((message: userMessagesType, index: number) => (
                <React.Fragment key={index}>
                  <div key={`day-${index}`}>
                    {message.day ? (
                      <div className="w-full flex justify-center ">
                        <p className="w-fit text-c700pxtext-black/50 my-2 py-1 px-4 rounded-lg bg-mainBackgroundColor text-[whitesmoke] shadow-lg">
                          {message.createdAt.split(" ")[0].toUpperCase()}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div
                    key={index}
                    className={`mb-2 ${message.sender._id === userInfo.ID
                      ? "w-full flex justify-end"
                      : "w-full self-start"
                      }`}
                  >
                    <p
                      className={`text-[whitesmoke] bg-mainBackgroundColor ${message.sender._id === userInfo.ID
                        ? "w-fit text-right  px-3 py-1 mr-2 rounded-lg"
                        : "w-fit px-3 py-1 rounded-lg"
                        }`}
                    >
                      {message.content}{" "}
                      <span className="text-[10px]">
                        {message.createdAt
                          .split(" ")[2]
                          .split(":")
                          .slice(0, 2)
                          .join(":") +
                          " " +
                          message.createdAt.split(" ")[3]}
                      </span>
                    </p>
                  </div>
                </React.Fragment>
              ))}
          </ScrollableFeed>
        </div>
      </div>

      <div className="flex items-center border-t border-mainBackgroundColor">
        <button onClick={handleSend} className="mx-2 p-[2%] rounded-lg bg-mainBackgroundColor text-[whitesmoke] hover:bg-hoverButtonColor md:px-4 md:py-2">
          <SendIcon fontSize="small" className="mr-1 flex items-center" />
          Send
        </button>
        <input
          value={currentMessage || ""}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          type="text"
          className="min-w-10 flex-1 inline m-2 p-[2%]  bg-[whitesmoke] border shadow-sm border-mainBackgroundColor placeholder-slate-400 focus:outline-none focus:border-mainBackgroundColor focus:ring-mainBackgroundColor rounded-md sm:text-sm focus:ring-1 md:p-2"
          placeholder="Type your message..."
        />
      </div>
    </>
  );
};

export default ChatArea;
