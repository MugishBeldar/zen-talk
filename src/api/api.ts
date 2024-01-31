import AXIOS from "./http";

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

export const signup = (userData:any) => {
  console.log("🚀 ~ signup ~ userData:", userData)
  return AXIOS.post("users/signup", userData);
};

export const login = (userData:any) => {
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
