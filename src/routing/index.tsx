import { Routes, Route } from "react-router-dom";
import { Login, Signup } from "../components";
import Chat from "../pages/chat";

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
