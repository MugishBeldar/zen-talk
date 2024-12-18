import { callModalStateType } from "@/store/call-model/call-model.action.types";
import { CallReceiverStateType } from "@/store/call-reciver-user/call-receiver-user.action.types";
import { callStateType } from "@/store/call-state/call-state-action.type";
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
  callReceiverState: CallReceiverStateType
  callState: callStateType
}
