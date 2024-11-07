import { API_ROUTES } from "@/utils/enum";
import AXIOS from "./http";
import Cookies from "js-cookie";
import { CreateChatBodyType, LoginType, SignupType } from "@/types/user";

export const handleRefreshTokenAPI = async (REFRESH_TOKEN: string) => {
  console.log(REFRESH_TOKEN);
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
  return response.data.data;
};

export const signup = async (userData: SignupType) => {
  return await AXIOS.post(API_ROUTES.POST_SIGNUP, userData);
};

export const login = async (userData: LoginType) => {
  return await AXIOS.post(API_ROUTES.POST_LOGIN, userData);
};

export const searchUser = async (name: string) => {
  return await AXIOS.get(`${API_ROUTES.GET_USERS}?name=${name}`);
};

export const getChatList = async () => {
  return await AXIOS.get(API_ROUTES.GET_CHATLIST);
};

export const getUserById = async (userId: string) => {
  return await AXIOS.get(`${API_ROUTES.GET_USERS}?userId=${userId}`);
};
export const getConversation = async (chatId: string) => {
  return await AXIOS.get(`${API_ROUTES.GET_CONVERSATION}/${chatId}`);
};

export const createChat = async (createChatBody: CreateChatBodyType) => {
	console.log(': createChat -> createChatBody', createChatBody);
  return await AXIOS.post(`${API_ROUTES.POST_CHAT}`, createChatBody);
}