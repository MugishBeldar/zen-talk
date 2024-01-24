import axios from "axios";
import { API_ENDPOINT } from "../utils/enum";

const AXIOS = axios.create({
  baseURL: API_ENDPOINT,
});

AXIOS.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

AXIOS.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    //   if (
    //     error.response.status === 401 &&
    //     originalRequest.url === 'http://127.0.0.1:3000/v1/auth/token'
    //   ) {
    //     router.push('/login')
    //     return Promise.reject(error)
    //   }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      return axios
        .post("/auth/token", {
          refresh_token: refreshToken,
        })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refresh_token", res.data.refreshToken); // set access token and refresh token
            axios.defaults.headers.common["Authorization"] =
              "Bearer " + localStorage.getItem("token");
            return axios(originalRequest);
          }
        });
    }
    return Promise.reject(error);
  }
);

export default AXIOS;
