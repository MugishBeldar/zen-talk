import { userType } from "@/types/user";
import { CALL_RECEIVER_USER } from "./call-receiver-user.action.types";

export const callReceiverUser = (value: userType) => {
  return {
    type: CALL_RECEIVER_USER.callReceiverUser,
    payload: value,
  };
};
