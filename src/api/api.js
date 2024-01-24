import AXIOS from "./http";

// API ENDPOINTS
export const signup = (userData) => {
    console.log(userData)
    return AXIOS.post('users/signup', userData);
}