import React from "react";
import { Tooltip } from "@mui/material";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import useEditController from "./edit.controller";

interface editType {
    email: string;
    name: string;
}

const Edit = ({email, name}:editType) => {
  const {handleEdit} = useEditController();
  return (
    <>
      <Tooltip onClick={handleEdit} title="Edit" arrow placement="top-end">
        <ModeEditOutlinedIcon className="cursor-pointer mr-6" color="primary" />
      </Tooltip>
    </>
  );
};

export default Edit;
