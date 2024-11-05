import { cloneDeep } from "lodash";
import { CHAT_LIST } from "./chat-list.action.types";
import { ChatListType } from "@/types/user";

interface ActionType {
  type: string;
  payload: ChatListType[];
}

const initialState = {
  chatList: [] as ChatListType[],
};

function isSetChatListReducer(
  state = cloneDeep(initialState),
  action: ActionType
) {
  switch (action.type) {
    case CHAT_LIST.SET: {
      return {
        ...state,
        chatList: action.payload,
      };
    }
    default:
      return state;
  }
}

export default isSetChatListReducer;
