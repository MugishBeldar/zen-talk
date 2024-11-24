/* eslint-disable react-hooks/exhaustive-deps */
import { getChatList } from "@/api/api";
import { chatList } from "@/store/chat-list/chat-list.action";
import { ChatListType, LoggedUserType } from "@/types/user";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { spinner } from "@/store/spinner/spinner.action.ts";

const useChatListController = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await getChatList();
      dispatch(chatList(response.data));
      setIsLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    const lastChat = Cookies.get("LAST_CHAT");
    if (lastChat) {
      const { reciverUserId, chatId } = JSON.parse(lastChat);
      navigate(`/${reciverUserId}/chat/${chatId}`);
    }
  }, []);

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

  return { getReciverUserId, handleClick, isLoading };
};

export default useChatListController;
