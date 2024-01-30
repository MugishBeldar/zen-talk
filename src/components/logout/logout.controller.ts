import Cookies from "js-cookie";
import { useNavigate } from "react-router";

const useLogOutController = () => {
  const navigate = useNavigate();
  const handleLogOut = () => {
    Cookies.remove("USER_INFO");
    Cookies.remove("TOKEN");
    navigate("/");
  };
  return { handleLogOut };
};

export default useLogOutController;
