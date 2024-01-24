import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginSignup from "../pages/login-signup";
import Home from "../pages/home";

const MainRouting = () => {
  return (
    <>
      <Routes>
        {/* login and signup */}
        <Route path="/" element={<LoginSignup />} />
        {/* home page  */}
        <Route path="/home" element={<Home/>}/>
      </Routes>
    </>
  );
};

export default MainRouting;
