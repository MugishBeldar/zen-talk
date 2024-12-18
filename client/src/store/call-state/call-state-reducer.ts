import { cloneDeep } from "lodash";
import { CALL_STATE, callStateType } from "./call-state-action.type";

const initialState: callStateType = {
  isOutGoingCall: false,
  isIncomingCall: false,
  isCallAccepted: false,
};

export const initiateCallState = (
  state = cloneDeep(initialState),
  action: { type: string; payload: Partial<Record<string, callStateType>>; }
): callStateType => {
  switch (action.type) {
    case CALL_STATE.SET_CALL_STATE: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state;
  }
};
