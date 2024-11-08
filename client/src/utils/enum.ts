import { Slide } from "react-toastify";
// const API_ENDPOINT_V1 = "https://zen-talk-server.onrender.com/api/v1";
const API_ENDPOINT_V1 = "http://localhost:5000/api/v1";
export const API_ENDPOINT = API_ENDPOINT_V1;
const STATISTICS_API = {
  GET_DETAILS: `/get-details`,
  POST_REFRESHTOKEN: `/token/refreshtoken`,
  POST_SIGNUP: `/users/register`,
  POST_LOGIN: `/users/login`,
  GET_USERS: `/users`,
  GET_CHATLIST: `/chats`,
  GET_CONVERSATION: `/messages`,
  POST_CHAT: `/chats`,
  UPDATE_USER: `/users/editprofile`,
};
export const TOAST_OBJ = {
  className: "toast-bg-color",
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Slide,
} as const;
export const API_ROUTES = {
  ...STATISTICS_API,
};
export const DAYS: { [key: number]: string } = {
  0: "Sunday", // Adjusted Sunday to 0
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
