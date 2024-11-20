/* eslint-disable @typescript-eslint/no-unused-vars */
import { getConversation, getUserById } from "@/api/api";
import { stateType } from "@/types/store";
import { MessageType, SenderType, userType } from "@/types/user";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import { chatList as chatListAction } from "@/store/chat-list/chat-list.action";
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
  const dispatch = useDispatch();

  const chatList = useSelector((state: stateType) => {
    return state.chatListState.chatList;
  });

  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );

  useEffect(() => {
    if (conversation.length > 0 && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        block: "end",
        behavior: "auto",
      });
    }
  }, [conversation]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("setup", { id: user.id });

    socket.on("connected", () => {
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
      console.log("\n\n[+]: useChatAreaController -> data", data);
      setConversation((prevConversation) => [...prevConversation, data]);
    });

    return () => {
      socket.off("message received");
    };
  });

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

    const selectedChat = chatList.find((chat) => chat._id === chatId);
    if (selectedChat && chatId) {
      // Update the selected chat with the new latestMessage
      selectedChat.latestMessage = msg;

      // Replace the selected chat in the newChatList and sort by updatedAt
      const newChatList = chatList
        .map((chat) => (chat._id === chatId ? selectedChat : chat))
        .sort((a, b) => {
          if (a.latestMessage && b.latestMessage) {
            // Convert updatedAt to dates only if both latestMessages exist
            const dateA = new Date(a.latestMessage.updatedAt).getTime();
            const dateB = new Date(b.latestMessage.updatedAt).getTime();
            return dateB - dateA;
          }
          if (a.latestMessage) return -1; // Place chats with latestMessage above those without
          if (b.latestMessage) return 1; // Place chats without latestMessage below those with
          return 0; // Keep the original order for chats without latestMessage
        });

      dispatch(chatListAction(newChatList));
    }

    // Add the new message to the conversation
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
