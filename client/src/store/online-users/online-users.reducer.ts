import { cloneDeep } from "lodash";
import { ONLINE_USERS } from "./online-users.action.types";

const initialState = {
  onlineUsers: undefined,
};

function initiateOnlineUsersReducer(
  state = cloneDeep(initialState),
  action: {
    type: string;
    payload: string[];
  }
) {
  switch (action.type) {
    case ONLINE_USERS.ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: action.payload,
      };
    }
    default:
      return state;
  }
}

export { initiateOnlineUsersReducer };
