/* eslint-disable react-hooks/exhaustive-deps */
import { getChatList } from "@/api/api";
import { chatList } from "@/store/chat-list/chat-list.action";
import { ChatListType, LoggedUserType } from "@/types/user";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useChatListController = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const lastChat = Cookies.get("LAST_CHAT");
    if (lastChat) {
      const { reciverUserId, chatId } = JSON.parse(lastChat);
      navigate(`/${reciverUserId}/chat/${chatId}`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const response = await getChatList();
      dispatch(chatList(response.data));
    })();
  }, [dispatch]);

  function getReciverUserId(chat: ChatListType, loggedUser: LoggedUserType) {
    const reciverUserId = chat.users?.find(
      (user) => loggedUser.id.trim() !== user._id
    );
    return reciverUserId?._id;
  }

  const handleClick = (chat: ChatListType, loggedUser: LoggedUserType) => {
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

  return { getReciverUserId, handleClick };
};

export default useChatListController;
