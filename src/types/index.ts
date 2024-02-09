export interface userTypes {
  createdAt: string;
  email: string;
  name: string;
  profilePic?: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

export interface userType {
  EMAIL: string;
  ID: string;
  NAME: string;
  PROFILEPIC: string;
}

export interface loginType {
  email: string;
  password: string;
}

export interface signupType extends loginType {
  name: string;
  profilePicture: string;
}


export interface chatType {
  _id: string;
  chatName: string;
  users?: userTypes[] | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  latestMessage: userMessagesType
}

export interface senderType {
  _id: string;
  name: string;
  email: string;
}

export interface userMessagesType {
  chat?: chatType[] | null;
  content?: string;
  createdAt: string;
  day?: boolean;
  sender: senderType;
  updatedAt?: string;
  _v: 0;
  _id: string;
}
