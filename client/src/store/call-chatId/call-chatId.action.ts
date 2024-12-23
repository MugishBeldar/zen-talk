import CALL_CHATID from "./call-chatId.action.types";
export const setCallChatId = (value: string) => ({
  type: CALL_CHATID.CHATID,
  payload: value,
});