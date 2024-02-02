import React, {
  HTMLInputTypeAttribute,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { chatType, userType, userTypes } from "../../types";
import { getUserMessages, sendMessage } from "../../api/api";
import Cookies from "js-cookie";

interface ChatAreaProps {
  clickedUser: userTypes | null;
  selectedChat: chatType | null;
}

const ChatArea = ({ clickedUser, selectedChat }: ChatAreaProps) => {
  const [userMessages, setuserMessages] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [isDayRender, setIsDayRender] = useState<boolean>(false);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const userInfo: userType = userInfoStringify && JSON.parse(userInfoStringify);

  const fetchUserChats = async () => {
    if (selectedChat) {
      const response = await getUserMessages(selectedChat?._id);
      if (response?.data?.data) {
        // setuserMessages(response.data.data);
        mapUserMessages(response.data.data);
      }
    }
  };

  const mapUserMessages = (data: any) => {
    let day: string = "";
    const mapedData = data.map((message: any) => {
      // console.log(message,":::::")
      if (day !== message.createdAt.split(" ")[0]) {
        day = message.createdAt.split(" ")[0];
        message.day = true;
        return message;
      }
      message.day = false;
      return message;
    });
    setuserMessages(mapedData);
  };
  useEffect(() => {
    fetchUserChats();
  }, [clickedUser]);

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setCurrentMessage(e.currentTarget.value);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      console.log(currentMessage);
      if (currentMessage && selectedChat?._id) {
        const response = await sendMessage({
          content: currentMessage,
          chatId: selectedChat?._id,
        });
        console.log("🚀 ~ handleKeyDown ~ response:", response);
      }
      setCurrentMessage("");
      fetchUserChats();
    }
  };
  return (
    <>
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
      <div className="flex-1 flex flex-col justify-end p-4">
        {userMessages &&
          userMessages.map((message: any, index: number) => {
            if (message.createdAt.split(" ")[0] !== day) {
              setDay(message.createdAt.split(" ")[0]);
              setIsDayRender(true);
            }
            return (
              <>
                <div>
                  {message.day ? (
                    <div className="w-full flex justify-center">
                      <p className="w-fit text-center text-black/50 my-2 py-1 px-4 rounded-lg bg-gray-200">
                        {message.createdAt.split(" ")[0].toUpperCase()}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div
                  key={index}
                  className={`mb-2 ${
                    message.sender._id === userInfo.ID
                      ? "self-end"
                      : "self-start"
                  } `}
                >
                  <div
                    className={`max-w-xs rounded-lg overflow-hidden ${
                      message.sender._id === userInfo.ID
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="px-2 py-1">
                      <p className="text-[16px]">
                        {message.content}{" "}
                        <span className="text-[10px] text-right">
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
                  </div>
                </div>
              </>
            );
          })}
      </div>

      <div className="flex items-center border-t-2">
        <input
          value={currentMessage || ""}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          type="text"
          className="min-w-10 flex-1 inline m-2 p-[2%]  bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500  rounded-md sm:text-sm focus:ring-1 md:p-2"
          placeholder="Type your message..."
        />

        <button className="p-[2%] rounded-lg bg-blue-500 text-white hover:bg-blue-700 md:px-4 md:py-2">
          😀 Emoji
        </button>

        <button className="mx-2 p-[2%] rounded-lg bg-green-500 text-white hover:bg-green-700  md:px-4 md:py-2">
          <SendIcon
            fontSize="small"
            className="mr-1 flex items-center mt-[-2px ]"
          />
          Send
        </button>
      </div>
    </>
  );
};

export default ChatArea;
