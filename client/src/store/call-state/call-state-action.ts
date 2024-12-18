import { CALL_STATE, callStateType } from "./call-state-action.type";

export const setCallState = (value: callStateType) => {
  return {
    type: CALL_STATE.SET_CALL_STATE,
    payload: value,
  };
};
