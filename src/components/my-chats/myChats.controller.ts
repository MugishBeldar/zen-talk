import { getChats } from "../../api/api";
import { chats } from "../../store/chats/chat.action";
import { chatType } from "../../types";
import { useDispatch } from "react-redux";

interface useMyChatsContrllerProps {
  setChats: React.Dispatch<React.SetStateAction<chatType[]>>;
}

const useMyChatsContrller = ({ setChats }: useMyChatsContrllerProps) => {
  const dispatch = useDispatch();
  const fetchChats = async () => {
    try {
      const response = await getChats();
      if(response?.data?.data) {
        dispatch(chats(response?.data?.data));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return {
    fetchChats,
  };
};

export default useMyChatsContrller;
