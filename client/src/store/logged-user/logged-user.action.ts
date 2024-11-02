import { LoggedUserType } from "@/types/user";
import LOGGED_USER_ACTION from "./logged-user.action.types";

export const loggedUser = (value: LoggedUserType) => {
  return {
    type: LOGGED_USER_ACTION.LOGGED_USER,
    payload: value,
  };
};
