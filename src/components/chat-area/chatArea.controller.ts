import { KeyboardEvent } from "react";
import { getUserMessages, sendMessage } from "../../api/api";
import { chatType, userTypes } from "../../types"
interface useChatAreaControllerPropes {
    clickedUser: userTypes | null;
    selectedChat: chatType | null;
    setuserMessages: any;
    setCurrentMessage: React.Dispatch<React.SetStateAction<string | null>>;
    currentMessage: string | null
  }
const useChatAreaController = ({clickedUser, selectedChat, setuserMessages, setCurrentMessage, currentMessage}:useChatAreaControllerPropes) => {
    const fetchUserChats = async () => {
        if (selectedChat) {
          const response = await getUserMessages(selectedChat?._id);
          mapUserMessages(response?.data?.data);
        }
      };

      const mapUserMessages = (data: any) => {
        let day: string = "";
        const mapedData = data.map((message: any) => {
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

      const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        setCurrentMessage(e.currentTarget.value);
      };

      const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Enter") {
          if (currentMessage && selectedChat?._id) {
            await sendMessage({
              content: currentMessage,
              chatId: selectedChat?._id,
            });
          }
          setCurrentMessage("");
          fetchUserChats();
        }
      };

    return {fetchUserChats, handleInputChange, handleKeyDown}
}

export {useChatAreaController}