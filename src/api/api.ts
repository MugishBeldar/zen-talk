import AXIOS from "./http";

// API ENDPOINTS
export const signup = (userData:any) => {
  return AXIOS.post("users/signup", userData);
};

export const login = (userData:any) => {
  try {
    return AXIOS.post("users/login", userData);
  } catch (error) {
    throw error;
  }
};
