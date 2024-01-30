import { Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import React from "react";
import useLogOutController from "./logout.controller";

const Logout = () => {
    const {handleLogOut} = useLogOutController();
  return (
    <>
      <Tooltip onClick={handleLogOut} title="Logout" arrow placement="top-end">
        <LogoutIcon className="cursor-pointer " color="error" />
      </Tooltip>
    </>
  );
};

export default Logout;
