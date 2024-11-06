import { getConversation, getUserById } from "@/api/api";
import { stateType } from "@/types/store";
import { MessageType, userType } from "@/types/user";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
// import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

// interface UseChatAreaControllerProps {
//   socket: Socket;
// }

const useChatAreaController = () => {
  const { chatId, userId } = useParams();
  const [conversation, setConversation] = useState<MessageType[]>([]);
  const [reciverUser, setReciverUser] = useState<userType>();
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );

  // Fetch conversation and receiver user
  useEffect(() => {
    (async () => {
      if (chatId && userId) {
        const response = await getConversation(chatId);
        const reciver = await getUserById(userId);

        if (response.data && reciver.data) {
          setReciverUser(reciver.data[0]);
          setConversation(response.data);
        }
      }
    })();
  }, [chatId, userId]);

  // Listen for incoming messages
  // useEffect(() => {
  //   socket.on("messageResponse", (data) => {
  //     // Update conversation with the new message without relying on the old state
  //     setConversation((prevConversation) => [...prevConversation, data]);
  //   });

  //   return () => {
  //     // Clean up listener when the component unmounts
  //     socket.off("messageResponse");
  //   };
  // }, [socket]);

  // Send message to the server
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent sending empty messages

    const msg = {
      _id: uuidv4(),
      sender: { _id: user?.id },
      content: newMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Sending message:", msg);
    // socket.emit("message", msg); // Emit message to server
    setNewMessage(""); // Clear input field
  };

  return {
    conversation,
    reciverUser,
    handleSendMessage,
    setNewMessage,
    newMessage,
  };
};

export default useChatAreaController;
