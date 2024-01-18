import React from "react";
import { useSelector } from "react-redux";
import { Login, Signup, Tabs } from "../components";

const LoginSignup = () => {
  const login = useSelector((state: any) => state.authState.logIn);
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <Tabs />
      {login ? <Login /> : <Signup />}
    </div>
  );
};

export default LoginSignup;
