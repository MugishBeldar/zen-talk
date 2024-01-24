// const API_ENDPOINT_V1 = "https://details-management-kv4b.onrender.com/details-management/api/v1";
const API_ENDPOINT_V1 = "http://localhost:8080/api/v1";
export const API_ENDPOINT = API_ENDPOINT_V1;
const STATISTICS_API = {
  GET_DETAILS : `${API_ENDPOINT}/get-details`,
};


export const API_ROUTES = {
  ...STATISTICS_API,
};