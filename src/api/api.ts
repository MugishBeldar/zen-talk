import AXIOS from "./http";
import {loginType, signupType} from '../types'
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

type UpdateUserData = UpdateUserDataWithProfilePic | UpdateUserDataWithoutProfilePic;


export const signup = (userData:signupType) => {
  // console.log("🚀 ~ signup ~ userData:", userData)
  try { 
    return AXIOS.post("users/signup", userData);
  } catch (error) {
    throw error;
  }
};

export const login = (userData:loginType) => {
  // console.log("🚀 ~ login ~ userData:", userData)
  try {
    return AXIOS.post("users/login", userData);
  } catch (error) {
    throw error;
  }
};

export const searchUser = (name:string)=>{
  try {
    return AXIOS.get(`users?name=${name}`);
  } catch (error) {
    throw error;
  }
}

export const updateUser = (updateUserData: UpdateUserData) => {
    try {
      return AXIOS.put(`users/editprofile`, updateUserData);
    } catch (error) {
      throw error;
    }
  }

export const getChats = () => {
  try {
    return AXIOS.get('chat');
    
  } catch (error) {
    throw error;
  }
}

export const getChatForAUser = (body: {userId: string}) => {
  try {
    return AXIOS.post('chat', body);
  } catch (error) {
    throw error;
  }
}

export const getUserMessages = (chatId:string)=> {
  try {
    return AXIOS.get(`message/${chatId}`);
  } catch (error) {
    throw error;
  }
}

export const sendMessage = (body: {content: string, chatId:string}) => {
  try {
    return AXIOS.post('message', body);
  } catch (error) {
    throw error;
  }
}
