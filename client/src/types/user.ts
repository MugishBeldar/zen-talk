export type LoginType = {
  email: string;
  password: string;
};

export type SignupType = LoginType & {
  name: string;
};

export type ErrorType = {
  success: boolean;
  message: string;
  statusCode: number;
  data: null;
};

export type LoggedUserType = {
  id: string;
  name: string;
  email: string;
  profilePic: null | {
    type: string;
    data: Buffer;
  };
};

export type userType = LoggedUserType & {
  _id: string;
  __v: number;
};

export type ChatListType = TimeStampType & {
  _id: string;
  chatName: string;
  users?: (userType & TimeStampType)[];
  latestMessage: MessageType;
  __v: number;
};

export type MessageType = TimeStampType & {
  _id: string;
  sender: SenderType;
  content: string;
  chat: string;
};

export type SenderType = {
  _id: string;
  name: string;
  email: string;
};

export type TimeStampType = {
  createdAt: string;
  updatedAt: string;
};

// export type ConversationType = TimeStampType & {
//   _id: string;
//   sender: SenderType;
//   content: string;
//   chat: ChatType;
// };

export type ChatType = {
  _id: string;
  users: string[];
};

export type CreateChatBodyType = {
  userId: string;
};


export interface CallLogsTypes {
  callStates: CallStatesTypes;
  _id: string;
  caller: CallerOrReceiverTypes;
  receiver: CallerOrReceiverTypes;
  callDuration: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  callMessage: MessageType;
}
export interface CallStatesTypes {
  isOutGoingCall: boolean;
  isIncomingCall: boolean;
  isCallAccepted: boolean;
}
export interface CallerOrReceiverTypes {
  _id: string;
  name: string;
  email: string;
  profilePic: null | {
    type: string;
    data: Buffer;
  };
}
