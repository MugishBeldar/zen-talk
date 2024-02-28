import { Routes, Route } from "react-router-dom";

import Chat from "../pages/chat";
import { Login, Signup } from "../components";

const MainRouting = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* home page  */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
};

export default MainRouting;
