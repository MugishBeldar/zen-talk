/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { logIn, signUp } from "../../store/auth/auth.action";

const Tabs = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("login");

  const handleTabClick = (tab: React.SetStateAction<string>) => {
    if (tab === "login") {
      dispatch(logIn());
    } else if (tab === "signup") {
      dispatch(signUp());
    }
    setActiveTab(tab);
  };

  return (
    <>
      {/* Your other content */}
      <div className="flex justify-center font-bold">
        <a
          onClick={() => handleTabClick("login")}
          className={`py-2 px-4 rounded mr-2 cursor-pointer text-lg ${
            activeTab === "login"
              ? "bg-green-700 text-white"
              : "bg-white hover:bg-green-700 hover:text-white"
          }`}
        >
          Login
        </a>
        <a
          onClick={() => handleTabClick("signup")}
          className={`py-2 px-4 rounded cursor-pointer text-lg ${
            activeTab === "signup"
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-blue-500 hover:text-white"
          }`}
        >
          Sign-Up
        </a>
      </div>
    </>
  );
};

export default Tabs;
