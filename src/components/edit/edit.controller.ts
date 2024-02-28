import { useDispatch, useSelector } from "react-redux";

import { edit } from "../../store/edit/edit.action";

const useEditController = () => {
  const dispatch = useDispatch();
  const editState = useSelector(
    (state: any) => state.editState.edit,
  );
    const handleEdit = () => {
        dispatch(edit(!editState));
    }
    return {handleEdit}
}
export default useEditController;
