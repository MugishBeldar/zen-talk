import { SPINNER } from "@/store/spinner/spinner.action.types.ts";

export const spinner = (value: boolean) => ({
  type: SPINNER.LOADING,
  payload: value,
});
