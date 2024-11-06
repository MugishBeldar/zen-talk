import { Slide } from "react-toastify";
// const API_ENDPOINT_V1 = "https://zen-talk-server.onrender.com/api/v1";
const API_ENDPOINT_V1 = "http://localhost:5000/api/v1";
export const API_ENDPOINT = API_ENDPOINT_V1;
const STATISTICS_API = {
  GET_DETAILS: `${API_ENDPOINT}/get-details`,
  POST_REFRESHTOKEN: `${API_ENDPOINT}/token/refreshtoken`,
  POST_SIGNUP: `${API_ENDPOINT}/users/register`,
  POST_LOGIN: `${API_ENDPOINT}/users/login`,
  GET_USERS: `${API_ENDPOINT}/users`,
  GET_CHATLIST: `${API_ENDPOINT}/chats`,
  GET_CONVERSATION: `${API_ENDPOINT}/messages`,
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
