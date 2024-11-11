import axios from "axios";
import Cookies from "js-cookie";
import { API_ENDPOINT } from "@/utils/enum";
import { handleRefreshTokenAPI } from "./api";

const AXIOS = axios.create({
  baseURL: API_ENDPOINT,
});

AXIOS.interceptors.request.use(
  async (config) => {
    const tokens = Cookies.get("TOKEN");
    let ACCESSTOKEN;
    let REFRESH_TOKEN;
    if (tokens) {
      ({ ACCESSTOKEN, REFRESH_TOKEN } = JSON.parse(tokens));
    }
    if (config.url === "users/login") {
      config.headers["Content-Type"] = "application/json";
    }
    if (config.url === "/refreshtoken") {
      config.headers["Authorization"] = `Bearer ${REFRESH_TOKEN}`;
      config.headers["Content-Type"] = "application/json";
    } else if (ACCESSTOKEN) {
      config.headers["Authorization"] = `Bearer ${ACCESSTOKEN}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

AXIOS.interceptors.response.use(
  (response) => {
    // Handle /refresh_token response if needed
    if (response.config.url === "/refresh_token" && response.data) {
      const { accessToken, refreshToken } = response.data;
      Cookies.set(
        "TOKEN",
        JSON.stringify({
          ACCESSTOKEN: accessToken,
          REFRESH_TOKEN: refreshToken,
        })
      );
    }
    return response.data;
  },
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.message !== "Invalid credentials"
    ) {
      console.log("401 Unauthorized - Attempting token refresh");

      const tokens = Cookies.get("TOKEN");
      let REFRESH_TOKEN;

      if (tokens) {
        ({ REFRESH_TOKEN } = JSON.parse(tokens));
      }

      try {
        const newTokens = await handleRefreshTokenAPI(REFRESH_TOKEN);
        if (newTokens) {
          const { accessToken, refreshToken } = newTokens;
          Cookies.set(
            "TOKEN",
            JSON.stringify({
              ACCESSTOKEN: accessToken,
              REFRESH_TOKEN: refreshToken,
            })
          );
          //   // Retry the failed request with the new access token
          error.config.headers["Authorization"] = `Bearer ${accessToken}`;
          return AXIOS.request(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        Cookies.remove("TOKEN");
        window.location.reload();
      }
    } else if (
      error.response &&
      (error.response.status === 500 || error.response.status === 503)
    ) {
      alert("Server under maintenance");
    } else {
      throw error;
    }
  }
);

export default AXIOS;
