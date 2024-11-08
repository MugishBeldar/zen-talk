import { ChatListType } from "@/types/user";
import { CHAT_LIST } from "./chat-list.action.types";

export const chatList = (value: ChatListType[]) => ({
  type: CHAT_LIST.SET,
  payload: value,
});
