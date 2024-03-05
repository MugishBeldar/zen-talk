import { Slide, } from "react-toastify";
const API_ENDPOINT_V1 = "https://zen-talk-server.onrender.com/api/v1";
// const API_ENDPOINT_V1 = "http://localhost:5000/api/v1";
export const API_ENDPOINT = API_ENDPOINT_V1;
const STATISTICS_API = {
  GET_DETAILS: `${API_ENDPOINT}/get-details`,
};
export const TOAST_OBJ = {
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
