import { ChatListType } from "@/types/user";

export const CHAT_LIST = {
  SET: "SET",
};

export type chatListStateType = {
  chatList: ChatListType[];
};
