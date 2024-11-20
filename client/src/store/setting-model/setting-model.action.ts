// import AUTH_ACTION from './auth.action.types'
import OPEN_SETTING from "./setting-model.action.types";

export const openSetting = (value: boolean) => ({
  type: OPEN_SETTING.CLICKED,
  payload: value,
});

// export const signUp = () => ({
//     type: AUTH_ACTION.SIGNUP
// })
