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
  profilePic: string | undefined;
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
