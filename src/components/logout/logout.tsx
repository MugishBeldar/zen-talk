import { Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import useLogOutController from "./logout.controller";

const Logout = () => {
  const { handleLogOut } = useLogOutController();
  return (
    <>
      <Tooltip onClick={handleLogOut} title="Logout" arrow placement="top-end">
        <LogoutIcon className="cursor-pointer " sx={{ color: "#075E54" }} />
      </Tooltip>
    </>
  );
};

export default Logout;
