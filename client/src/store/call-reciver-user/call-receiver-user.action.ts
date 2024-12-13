import { LoggedUserType, userType } from "@/types/user";
import { LOGGED_USER_ACTION } from "./logged-user.action.types";

export const callReceiverUser = (value: userType) => {
  return {
    type: LOGGED_USER_ACTION.LOGGED_USER,
    payload: value,
  };
};
