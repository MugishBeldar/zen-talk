import { Tooltip } from "@mui/material";
import useEditController from "./edit.controller";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";

interface editType {
  email: string;
  name: string;
}

const Edit = ({ email, name }: editType) => {
  const { handleEdit } = useEditController();
  return (
    <>
      <Tooltip onClick={handleEdit} title="Edit" arrow placement="top-end">
        <ModeEditOutlinedIcon className="cursor-pointer mr-6 " sx={{ color: "#075E54" }} />
      </Tooltip>
    </>
  );
};

export default Edit;
