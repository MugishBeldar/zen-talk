import { cloneDeep } from "lodash";
import CALL_MODAL from "./call-model.action.types";
const initialState = {
  open: false,
};

function initiateCallModal(
  state = cloneDeep(initialState),
  action: { type: string; payload: boolean }
) {
  switch (action.type) {
    case CALL_MODAL.OPEN: {
      state.open = action.payload;
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}

export { initiateCallModal };
