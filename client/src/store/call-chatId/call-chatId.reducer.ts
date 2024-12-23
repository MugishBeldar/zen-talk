import { cloneDeep } from "lodash";
import CALL_CHATID, { callChatIdType } from "./call-chatId.action.types";

const initialState: callChatIdType = {
  chatId: null,
};

function initiateCallChatIdReducer(
  state = cloneDeep(initialState),
  action: { type: string; payload: string }
) {
  switch (action.type) {
    case CALL_CHATID.CHATID: {
      state.chatId = action.payload;
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}

export { initiateCallChatIdReducer };
