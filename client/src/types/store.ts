import { callModalStateType } from "@/store/call-model/call-model.action.types";
import { chatListStateType } from "@/store/chat-list/chat-list.action.types";
import { LoggedUserStateType } from "@/store/logged-user/logged-user.action.types";
import { onlineUsersStateType } from "@/store/online-users/online-users.action.types";
import { screenSizeStateType } from "@/store/screen-sizes/screen-sizes.action.types";
import { spinnerStateType } from "@/store/spinner/spinner.action.types";

export interface stateType {
  loggedUserState: LoggedUserStateType;
  chatListState: chatListStateType;
  spinnerState: spinnerStateType;
  screenSizeState: screenSizeStateType;
  onlineUsersState: onlineUsersStateType;
  callModalState: callModalStateType;
}
