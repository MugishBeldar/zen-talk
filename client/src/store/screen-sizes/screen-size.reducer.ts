import { cloneDeep } from "lodash";
import { SCREENSIZE, screenSizeStateType } from "./screen-sizes.action.types";

const initialState = {
  largeScreen: false,
  smallScreen: false,
};

function initiateScreenSizeReducer(
  state = cloneDeep(initialState),
  action: {
    type: string;
    payload: screenSizeStateType;
  }
) {
  switch (action.type) {
    case SCREENSIZE.SIZE: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state;
  }
}

export { initiateScreenSizeReducer };
