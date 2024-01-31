export interface userTypes {
    createdAt: string;
    email: string;
    name: string;
    profilePic?: string;
    updatedAt: string;
    __v: number;
    _id: string;
  }
  export interface Weather {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
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
  name:string;
  profilePicture: string;
}

export interface chatType {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users?: (userTypes)[] | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}