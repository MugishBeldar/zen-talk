/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from "lodash";
import OPEN_SETTING from "./setting-model.action.types";
const initialState = {
  clicked: false,
};

function openSettingReducer(
  state = cloneDeep(initialState),
  action: { type: any; payload: boolean }
) {
  switch (action.type) {
    case OPEN_SETTING.CLICKED: {
      state.clicked = action.payload;
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}

export { openSettingReducer };
