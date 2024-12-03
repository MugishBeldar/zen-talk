import { ONLINE_USERS } from "./online-users.action.types";

export const onlineUsers = (value: string[]) => ({
  type: ONLINE_USERS.ONLINE_USERS,
  payload: value,
});
