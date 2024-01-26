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
      <div className="flex justify-center ">
        <a
          onClick={() => handleTabClick("login")}
          className={`py-3 px-4 rounded mr-10 cursor-pointer shadow-lg text-base  ${
            activeTab === "login"
              ? "bg-green-700 text-white"
              : "bg-white hover:bg-green-700 hover:text-white"
          }`}
        >
          LOGIN
        </a>
        <a
          onClick={() => handleTabClick("signup")}
          className={`py-3 px-4 rounded cursor-pointer shadow-lg text-base ${
            activeTab === "signup"
              ? "bg-blue-500 text-white"
              : "bg-white  hover:bg-blue-500 hover:text-white"
          }`}
        >
          SIGN-UP
        </a>
      </div>
    </>
  );
};

export default Tabs;
