import { userType } from "@/types/user";

export const CALL_RECEIVER_USER = {
  callReceiverUser: 'callReceiverUser',
};

export interface CallReceiverStateType {
  callReceiverUser: userType;
}