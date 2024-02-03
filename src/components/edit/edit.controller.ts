import { useDispatch, useSelector } from "react-redux";
import { edit } from "../../store/edit/edit.action";

const useEditController = () => {
  const dispatch = useDispatch();
  const editState = useSelector(
    (state: any) => state.editState.edit,
  );
  // console.log(editState, ":::")
    const handleEdit = () => {
        dispatch(edit(!editState));
        // console.log('handle edit called')
    }
    return {handleEdit}
}
export default useEditController;
