import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginSignup from "../pages/login-signup";
import Chat from "../pages/chat";

const MainRouting = () => {
  return (
    <>
      <Routes>
        {/* login and signup */}
        <Route path="/" element={<LoginSignup />} />
        {/* home page  */}
        <Route path="/chat" element={<Chat/>}/>
      </Routes>
    </>
  );
};

export default MainRouting;
