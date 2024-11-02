import { cloneDeep } from "lodash";
import LOGGED_USER_ACTION from "./logged-user.action.types";
import { LoggedUserType } from "@/types/user";

interface ActionType {
  type: string;
  payload: LoggedUserType;
}
const initialState = {
  loggedUser: null,
};

function loggedUserReducer(
  state = cloneDeep(initialState),
  action: ActionType
) {
  switch (action.type) {
    case LOGGED_USER_ACTION.LOGGED_USER: {
      return {
        ...state,
        loggedUser: action.payload,
      };
    }
    default:
      return state;
  }
}

export default loggedUserReducer;
