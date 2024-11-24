/* eslint-disable @typescript-eslint/no-explicit-any */

import { cloneDeep } from "lodash";
import { SPINNER } from "@/store/spinner/spinner.action.types.ts";

const initialState = {
  loading: false,
};

function initiateSpinnerReducer(
  state = cloneDeep(initialState),
  action: {
    type: string;
    payload: boolean;
  }
) {
  switch (action.type) {
    case SPINNER.LOADING: {
      return {
        ...state,
        loading: action.payload
      };
    }
    default:
      return state;
  }
}

export { initiateSpinnerReducer };
