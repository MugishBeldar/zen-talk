import Cookies from "js-cookie";

function useAuth() {
  const tokens = Cookies.get("TOKEN");
  if (tokens) {
    return true;
  } else {
    return false;
  }
}

export default useAuth;
