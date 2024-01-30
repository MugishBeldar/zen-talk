import { API_ENDPOINT } from "../utils/enum";
import axios from "axios";
// import { USER_ACCESS_KEY } from "../utils";
// import handleRefreshTokenAPI from "./authentication/refresh-token/";
 import Cookies from "js-cookie";
const AXIOS = axios.create({
  baseURL: API_ENDPOINT,

});
 
AXIOS.interceptors.request.use(
  async (config) => {
    const tokens = Cookies.get('TOKEN');
    //@ts-ignore
    const {ACCESSTOKEN, REFRESH_TOKEN} = JSON.parse(tokens);
    const accessToken = Cookies.get(ACCESSTOKEN);
    const refreshToken = Cookies.get(REFRESH_TOKEN);
 
    if (config.url === "users/login") {
      config.headers["Content-Type"] = "application/json";
    }
 
    if (config.url === "/refresh_token") {
      config.headers["Authorization"] = `Bearer ${refreshToken}`;
      config.headers["Content-Type"] = "application/json";
    }
 
    if (ACCESSTOKEN) {
      config.headers["Authorization"] = `Bearer ${ACCESSTOKEN}`;
      config.headers["Content-Type"] = "application/json";
    }
 
    return config;
  },
  (error) => {
    Promise.reject(new Error(error.response.data));
  }
);
 
AXIOS.interceptors.response.use(
  async (response) => {
    if (response.config.url === "/refresh_token") {
      Cookies.set('TOKEN', await response?.data?.accessToken);
    }
    return response;
  },
  async (error) => {
    console.log("🚀 ~ error:", error)
    if (
      error.response &&
      error.response.data.detail === "Could not validate credentials"
    ) {
      Cookies.remove('TOKEN');
      // await handleRefreshTokenAPI();
      window.location.reload();
    } else if (error.response.status === 500 || error.response.status === 503) {
      alert("Server under maintenance");
    } else {
      throw error;
    }
  }
);
 
export default AXIOS;
