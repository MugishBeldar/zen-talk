import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { chatType, userType, userTypes } from "../../types";
import Cookies from "js-cookie";
import ScrollableFeed from "react-scrollable-feed";
import noMessage from "../../assets/noMessage.png";
import chatArea from "../../assets/chatareaImage.png";
import { useChatAreaController } from "./chatArea.controller";
// import Emoji from "../emoji/emoji";

interface ChatAreaProps {
  clickedUser: userTypes | null;
  selectedChat: chatType | null;
}

const renderUserInfo = (clickedUser: userTypes) => (
  <div className="flex items-center">
    <Avatar
      alt="Remy Sharp"
      src={
        clickedUser.profilePic
          ? clickedUser.profilePic
          : `https://ui-avatars.com/api/?background=000000&color=ffffff&name=${clickedUser.name}`
      }
      sx={{ marginRight: "20px", width: "50px", height: "50px" }}
    />
    <p>
      {clickedUser.name.charAt(0).toUpperCase() + clickedUser.name.slice(1)}
    </p>
  </div>
);

const ChatArea = ({ clickedUser, selectedChat }: ChatAreaProps) => {
  const [userMessages, setuserMessages] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  console.log("🚀 ~ ChatArea ~ currentMessage:", currentMessage)
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const userInfo: userType = userInfoStringify && JSON.parse(userInfoStringify);
  const { fetchUserChats, handleInputChange, handleKeyDown, handleSend } =
    useChatAreaController({
      clickedUser,
      selectedChat,
      setuserMessages,
      setCurrentMessage,
      currentMessage,
    });

  useEffect(() => {
    if (clickedUser) {
      fetchUserChats();
    }
  }, [clickedUser, selectedChat]);

  // const toggleEmojiPicker = () => {
  //   setEmojiPickerVisible(!emojiPickerVisible);
  // };

  return (
    <>
      {clickedUser && (
        <div className="flex bg-[#e4e4e4] p-1 mt-2 border-b-2  shadow-lg rounded-lg">
          <div className="text-2xl ml-3 w-[65%] text-[#040404]">
            {renderUserInfo(clickedUser)}
          </div>
        </div>
      )}

      {!clickedUser && (
        <div className=" bg-[#e4e4e4] p-1 my-4 border-b-2 rounded-lg">
          <div className=" text-[#040404]">
            <p className="uppercase text-center text-2xl">
              Chose a conversation on the left to start chatting
            </p>
          </div>
        </div>
      )}

      <div className="h-[84%] flex flex-col">
        <div className="flex-grow h-full p-4 mb-2 border-[#040404]">
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
              userMessages.map((message: any, index: number) => (
                <React.Fragment key={index}>
                  <div key={`day-${index}`}>
                    {message.day ? (
                      <div className="w-full flex justify-center ">
                        <p className="w-fit text-c700pxtext-black/50 my-2 py-1 px-4 rounded-lg bg-[#7e7e7e] text-white shadow-lg">
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
                      className={`text-[#040404] ${message.sender._id === userInfo.ID
                          ? "w-fit text-right bg-[#040404] text-white px-3 py-1 mr-2 rounded-lg"
                          : "w-fit bg-[#7e7e7e] text-white px-3 py-1 rounded-lg"
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

      <div className="flex items-center border-t border-[#7e7e7e] relative">
        {/* {emojiPickerVisible && (
          <div className="absolute mb-[50%]"><Emoji setEmojiPickerVisible={setEmojiPickerVisible} setCurrentMessage={setCurrentMessage} emojiPickerVisible={emojiPickerVisible}/></div>
        )}
        <button onClick={toggleEmojiPicker} className="p-[2%] ml-[1%] rounded-lg bg-[#040404] text-white hover:bg-[#7e7e7e] hover:text-[#040404] md:px-4 md:py-2">
          😀 Emoji
        </button> */}
        <button onClick={handleSend} className="mx-2 p-[2%] rounded-lg bg-[#040404] text-white hover:bg-[#7e7e7e] hover:text-[#040404] md:px-4 md:py-2">
          <SendIcon fontSize="small" className="mr-1 flex items-center" />
          Send
        </button>
        <input
          value={currentMessage || ""}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          type="text"
          className="min-w-10 flex-1 inline m-2 p-[2%]  bg-[#e4e4e4] border shadow-sm border-[#040404] placeholder-slate-400 focus:outline-none focus:border-[#040404] focus:ring-[#040404] rounded-md sm:text-sm focus:ring-1 md:p-2"
          placeholder="Type your message..."
        />
      </div>
    </>
  );
};

export default ChatArea;
