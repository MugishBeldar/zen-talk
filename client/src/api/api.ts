import { API_ROUTES } from "@/utils/enum";
import AXIOS from "./http";
import Cookies from "js-cookie";
import { LoginType, SignupType } from "@/types/user";

// API ENDPOINTS
// type UpdateUserDataWithProfilePic = {
//   name: string;
//   email: string;
//   profilePic: string | null;
// };

// type UpdateUserDataWithoutProfilePic = {
//   name: string;
//   email: string;
// };

// type UpdateUserData =
//   | UpdateUserDataWithProfilePic
//   | UpdateUserDataWithoutProfilePic;

export const handleRefreshTokenAPI = async (REFRESH_TOKEN: string) => {
  const response = await AXIOS.post(
    API_ROUTES.POST_REFRESHTOKEN,
    REFRESH_TOKEN
  );
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
};

export const signup = async (userData: SignupType) => {
  return await AXIOS.post(API_ROUTES.POST_SIGNUP, userData);
};

export const login = async (userData: LoginType) => {
  return await AXIOS.post(API_ROUTES.POST_LOGIN, userData);
};

// export const searchUser = async (name: string) => {
//   try {
//     return await AXIOS.get(`users?name=${name}`);
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateUser = async (updateUserData: UpdateUserData) => {
//   try {
//     return await AXIOS.put(`users/editprofile`, updateUserData);
//   } catch (error) {
//     throw error;
//   }
// };

// export const getChats = async () => {
//   try {
//     return await AXIOS.get("chats");
//   } catch (error) {
//     throw error;
//   }
// };

// export const getChatForAUser = async (body: { userId: string }) => {
//   try {
//     return await AXIOS.post("chats", body);
//   } catch (error) {
//     throw error;
//   }
// };

// export const getUserMessages = async (chatId: string) => {
//   try {
//     return await AXIOS.get(`messages/${chatId}`);
//   } catch (error) {
//     throw error;
//   }
// };

// export const sendMessage = async (
//   body: { content: string; chatId: string },
//   socket: any
// ) => {
//   try {
//     // console.log(body,"body in send message");
//     const response = await AXIOS.post("messages", body);
//     // console.log(response,"api in")
//     console.log("socket", socket.id);
//     socket.emit("send", response.data.data);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// };
