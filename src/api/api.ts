import AXIOS from "./http";
import { loginType, signupType } from "../types";
import Cookies from "js-cookie";

// API ENDPOINTS
type UpdateUserDataWithProfilePic = {
  name: string;
  email: string;
  profilePic: string | null;
};

type UpdateUserDataWithoutProfilePic = {
  name: string;
  email: string;
};

type UpdateUserData =
  | UpdateUserDataWithProfilePic
  | UpdateUserDataWithoutProfilePic;

export const handleRefreshTokenAPI = async (REFRESH_TOKEN: string) => {
  try {
    const response = await AXIOS.post("token/refreshtoken", REFRESH_TOKEN);
    if (response.data.data) {
      Cookies.set(
        "TOKEN",
        JSON.stringify({
          ACCESSTOKEN: response?.data?.data?.accessToken,
          REFRESH_TOKEN: response?.data?.data?.refreshToken,
          EXPIRES_IN: response?.data?.data?.expiresIn,
        })
      );
    }
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData: signupType) => {
  try {
    return await AXIOS.post("users/register", userData);
  } catch (error) {
    throw error;
  }
};

export const login = async (userData: loginType) => {
  // console.log("🚀 ~ login ~ userData:", userData)
  try {
    return await AXIOS.post("users/login", userData);
  } catch (error) {
    throw error;
  }
};

export const searchUser = async (name: string) => {
  try {
    return await AXIOS.get(`users?name=${name}`);
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (updateUserData: UpdateUserData) => {
  try {
    return await AXIOS.put(`users/editprofile`, updateUserData);
  } catch (error) {
    throw error;
  }
};

export const getChats = async () => {
  try {
    return await AXIOS.get("chats");
  } catch (error) {
    throw error;
  }
};

export const getChatForAUser = async (body: { userId: string }) => {
  try {
    return await AXIOS.post("chats", body);
  } catch (error) {
    throw error;
  }
};

export const getUserMessages = async (chatId: string) => {
  try {
    return await AXIOS.get(`messages/${chatId}`);
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (
  body: { content: string; chatId: string },
  socket: any
) => {
  try {
    // console.log(body,"body in send message");
    const response = await AXIOS.post("messages", body);
    // console.log(response,"api in")
    console.log("socket", socket.id);
    socket.emit("send", response.data.data);
    return response;
  } catch (error) {
    throw error;
  }
};
