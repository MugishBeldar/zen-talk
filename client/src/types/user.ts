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
