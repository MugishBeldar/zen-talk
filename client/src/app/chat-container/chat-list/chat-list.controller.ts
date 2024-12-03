/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { deleteUserChat, getChatList } from "@/api/api";
import { chatList } from "@/store/chat-list/chat-list.action";
import { ChatListType, LoggedUserType } from "@/types/user";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { spinner } from "@/store/spinner/spinner.action.ts";
import { stateType } from "@/types/store";
import { Socket } from "socket.io-client";
import { onlineUsers } from "@/store/online-users/online-users.actions";

interface UseChatListControllerProps {
  socket: Socket;
}
const useChatListController = ({ socket }: UseChatListControllerProps) => {
  const [idForDeleteChat, setIdForDeleteChat] = useState<string | undefined>();
  const [deleteModel, setDeleteModel] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_socketConnected, setSocketConnected] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const path = useLocation();

  const onlineUsersState = useSelector((state: stateType) => {
    return state.onlineUsersState.onlineUsers;
  });

  const screenSizes = useSelector((state: stateType) => {
    return state.screenSizeState;
  });

  const loggedUser = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });

  const userChatList = useSelector((state: stateType) => {
    return state.chatListState.chatList;
  });

  useEffect(() => {
    if (!socket || !loggedUser) return;

    socket.emit("setup", { id: loggedUser.id });

    socket.on("connected", () => {
      setSocketConnected(true);
    });

    return () => {
      socket.off("connected");
    };
  }, [socket, loggedUser]);

  useEffect(() => {
    socket.on("get new chat user", (_chatCreater, me) => {
      if (loggedUser?.id === me._id) {
        (async function () {
          const fetchChatListResponse = await getChatList();
          dispatch(chatList(fetchChatListResponse.data));
        })();
      }
    });

    return () => {
      socket.off("get new chat user");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      dispatch(onlineUsers(users));
    });

    return () => {
      socket.off("onlineUsers");
    };
  });

  useEffect(() => {
    (async () => {
      const response = await getChatList();
      dispatch(chatList(response.data));
      setIsLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    const lastChat = Cookies.get("LAST_CHAT");
    if (lastChat && screenSizes.largeScreen) {
      const { reciverUserId, chatId } = JSON.parse(lastChat);
      dispatch(spinner(true));
      navigate(`/${reciverUserId}/chat/${chatId}`);
      dispatch(spinner(false));
    } else {
      navigate(`/${loggedUser?.id}/chat`);
    }
  }, [screenSizes]);

  async function deleteChat(chatId: string) {
    const response = await deleteUserChat(chatId);
    if (response.data.toLowerCase() === "deleted") {
      const fetchChatListResponse = await getChatList();
      dispatch(chatList(fetchChatListResponse.data));
    }
  }

  function getReciverUserId(chat: ChatListType, loggedUser: LoggedUserType) {
    const reciverUserId = chat.users?.find(
      (user) => loggedUser.id.trim() !== user._id
    );
    return reciverUserId?._id;
  }

  const handleClick = (chat: ChatListType, loggedUser: LoggedUserType) => {
    dispatch(spinner(true));
    const reciverUserId = getReciverUserId(chat, loggedUser);
    Cookies.set(
      "LAST_CHAT",
      JSON.stringify({
        reciverUserId,
        chatId: chat._id,
      })
    );
    navigate(`/${reciverUserId}/chat/${chat._id}`);
  };

  return {
    getReciverUserId,
    handleClick,
    isLoading,
    setDeleteModel,
    deleteModel,
    chatId,
    path,
    userChatList,
    loggedUser,
    screenSizes,
    setIdForDeleteChat,
    deleteChat,
    idForDeleteChat,
    onlineUsersState,
  };
};

export default useChatListController;
