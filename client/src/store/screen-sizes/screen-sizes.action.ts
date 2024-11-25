import { SCREENSIZE, screenSizeStateType } from "./screen-sizes.action.types";

export const screenSize = (value: screenSizeStateType) => ({
  type: SCREENSIZE.SIZE,
  payload: value,
});
