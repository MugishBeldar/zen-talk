import { cloneDeep } from "lodash";
import { CALL_RECEIVER_USER } from "./call-receiver-user.action.types";
import { userType } from "@/types/user";

interface ActionType {
  type: string;
  payload: userType;
}
const initialState = {
  callReceiverUser: null,
};

function initiateCallReceiverReducer(
  state = cloneDeep(initialState),
  action: ActionType
) {
  switch (action.type) {
    case CALL_RECEIVER_USER.callReceiverUser: {
      return {
        ...state,
        callReceiverUser: action.payload,
      };
    }
    default:
      return state;
  }
}

export default initiateCallReceiverReducer;
