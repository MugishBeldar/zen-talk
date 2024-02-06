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


export const signup = async (userData:signupType) => {
  // console.log("🚀 ~ signup ~ userData:", userData)
  try { 
    return await AXIOS.post("users/signup", userData);
  } catch (error) {
    throw error;
  }
};

export const login = async (userData:loginType) => {
  // console.log("🚀 ~ login ~ userData:", userData)
  try {
    return await AXIOS.post("users/login", userData);
  } catch (error) {
    throw error;
  }
};

export const searchUser = async (name:string)=>{
  try {
    return await AXIOS.get(`users?name=${name}`);
  } catch (error) {
    throw error;
  }
}

export const updateUser = async (updateUserData: UpdateUserData) => {
    try {
      return await AXIOS.put(`users/editprofile`, updateUserData);
    } catch (error) {
      throw error;
    }
  }

export const getChats = async () => {
  try {
    return await AXIOS.get('chat');
    
  } catch (error) {
    throw error;
  }
}

export const getChatForAUser = async (body: {userId: string}) => {
  try {
    return await AXIOS.post('chat', body);
  } catch (error) {
    throw error;
  }
}

export const getUserMessages = async (chatId:string)=> {
  try {
    return await AXIOS.get(`message/${chatId}`);
  } catch (error) {
    throw error;
  }
}

export const sendMessage = async (body: {content: string, chatId:string}, socket:any) => {
  try {
    // console.log(body,"body in send message");
    const response = await AXIOS.post('message', body);
    // console.log(response,"api in")
    console.log('socket', socket.id)
    socket.emit('send', response.data.data);
    return response
  } catch (error) {
    throw error;
  }
}
