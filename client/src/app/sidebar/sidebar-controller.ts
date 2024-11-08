import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const useSidebarController = () => {
  const navigate = useNavigate();
  const handleLogOut = () => {
    Cookies.remove("TOKEN");
    navigate("/login");
  };
  return { handleLogOut };
};

export default useSidebarController;
