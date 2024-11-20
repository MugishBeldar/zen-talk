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

// import { useState, useEffect } from "react";
// import Cookies from "js-cookie";

// function useAuth() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const tokens = Cookies.get("TOKEN");
//     console.log("Tokens", tokens);
//     if (tokens) {
//       setIsAuthenticated(true);
//     } else {
//       setIsAuthenticated(false);
//     }
//   }, []);

//   return isAuthenticated;
// }

// export default useAuth;
