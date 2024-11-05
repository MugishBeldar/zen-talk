import { LoggedUserType } from "@/types/user";

export const LOGGED_USER_ACTION = {
  LOGGED_USER: 'LOGGED_USER',
};

export interface LoggedUserStateType {
  loggedUser?: null | LoggedUserType;
}