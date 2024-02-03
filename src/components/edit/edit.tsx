import React from "react";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import useEditController from "./edit.controller";
import { Tooltip } from "@mui/material";

interface editType {
    email: string;
    name: string;
}

const Edit = ({email, name}:editType) => {
  const {handleEdit} = useEditController();
  return (
    <>
      <Tooltip onClick={handleEdit} title="Edit" arrow placement="top-end">
        <ModeEditOutlinedIcon className="cursor-pointer mr-6" sx={{color:"#040404"}} />
      </Tooltip>
    </>
  );
};

export default Edit;
