// import AUTH_ACTION from './auth.action.types'
import CALL_MODAL from "./call-model.action.types";

export const setOpenCallModal = (value: boolean) => ({
  type: CALL_MODAL.OPEN,
  payload: value,
});