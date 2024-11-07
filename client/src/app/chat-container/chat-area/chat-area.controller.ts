/* eslint-disable @typescript-eslint/no-unused-vars */
import { getConversation, getUserById } from "@/api/api";
import { stateType } from "@/types/store";
import { MessageType, userType } from "@/types/user";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface UseChatAreaControllerProps {
  socket: Socket;
}

const useChatAreaController = ({ socket }: UseChatAreaControllerProps) => {
  const { chatId, userId } = useParams();
  const [conversation, setConversation] = useState<MessageType[]>([]);
  const [reciverUser, setReciverUser] = useState<userType>();
  const [newMessage, setNewMessage] = useState("");
  const [_socketConnected, setSocketConnected] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );

  useEffect(() => {
    if (conversation.length > 0 && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [conversation]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("setup", user);

    socket.on("connected", () => {
      console.log("Socket connection established with server");
      setSocketConnected(true);
    });

    return () => {
      socket.off("connected");
    };
  }, [socket, user]);

  useEffect(() => {
    (async () => {
      if (chatId && userId && socket) {
        const response = await getConversation(chatId);
        const reciver = await getUserById(userId);

        if (response.data && reciver.data) {
          setReciverUser(reciver.data[0]);
          setConversation(response.data);
        }
      }
      socket.emit("join room", chatId);
    })();
  }, [chatId, socket, userId]);

  useEffect(() => {
    socket.on("message received", (data) => {
      setConversation((prevConversation) => [...prevConversation, data]);
    });

    return () => {
      socket.off("message received");
    };
  }, [socket]);

  // Send message to the server
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent sending empty messages

    const msg: MessageType = {
      _id: uuidv4(),
      sender: {
        _id: user?.id || "",
        name: user?.name || "",
        email: user?.email || "",
      },
      chat: chatId || "",
      content: newMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversation((prevConversation) => [...prevConversation, msg]);
    const tokens = Cookies.get("TOKEN");
    if (tokens) {
      const { _, REFRESH_TOKEN } = JSON.parse(tokens);
      socket.emit(
        "new message",
        msg,
        {
          reciverId: userId || "",
          senderId: user?.id || "",
        },
        REFRESH_TOKEN
      );
    }

    setNewMessage(""); // Clear input field
  };

  return {
    conversation,
    reciverUser,
    handleSendMessage,
    setNewMessage,
    newMessage,
    lastMessageRef,
  };
};

export default useChatAreaController;
