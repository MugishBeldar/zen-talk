import { getChatList } from "@/api/api";
import { chatList } from "@/store/chat-list/chat-list.action";
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

  function extractTime(dateTimeString: string): string {
    const parts = dateTimeString.split(" ");
    const timeInHourAndMinutes = `${parts[2].split(":")[0]}:${
      parts[2].split(":")[1]
    } `;
    const AmOrPm = parts.slice(-2).join(" ");
    return parts[0] + " " + timeInHourAndMinutes + AmOrPm;
  }

  return { extractTime };
};

export default useChatListController;
