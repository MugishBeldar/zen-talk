import { getChatList } from "@/api/api";
import { chatList } from "@/store/chat-list/chat-list.action";
import { ChatListType, LoggedUserType } from "@/types/user";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useChatListController = () => {
  const dispatch = useDispatch();
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

  return {  getReciverUserId };
};

export default useChatListController;
