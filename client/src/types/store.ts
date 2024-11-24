import { chatListStateType } from "@/store/chat-list/chat-list.action.types";
import { LoggedUserStateType } from "@/store/logged-user/logged-user.action.types";
import { spinnerStateType } from "@/store/spinner/spinner.action.types";

export interface stateType {
  loggedUserState: LoggedUserStateType;
  chatListState: chatListStateType;
  spinnerState: spinnerStateType;
}
