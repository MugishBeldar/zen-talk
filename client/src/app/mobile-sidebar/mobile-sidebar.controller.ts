import { spinner } from "@/store/spinner/spinner.action";
import { stateType } from "@/types/store";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useMobileSidebarController = () => {
  const dispatch = useDispatch();
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );
  const navigate = useNavigate();

  const handleMessages = () => {
    dispatch(spinner(true));
    const lastChat = Cookies.get("LAST_CHAT");
    if (lastChat) {
      const { reciverUserId, chatId } = JSON.parse(lastChat);
      navigate(`/${reciverUserId}/chat/${chatId}`);
    } else {
      navigate("/");
    }
  };

  const handleSetting = () => {
    navigate(`/${user?.id}/setting`);
  };

  const handleLogOut = () => {
    Cookies.remove("TOKEN");
    Cookies.remove("LAST_CHAT");
    navigate("/login");
  };
  return {
    handleMessages,
    handleSetting,
    handleLogOut,
  };
};

export default useMobileSidebarController;
