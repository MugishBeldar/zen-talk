/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useDispatch } from "react-redux";
import { logIn, signUp } from "../../store/auth/auth.action";
const Tabs = () => {
  const dispatch = useDispatch();
  return (
    <>
      {/* <div className="bg-blue-100 w-full h-16 rounded-lg sm:w-[80%] md:w-[60%] lg:w-[40%] mx-auto">
        <p>Application</p>
      </div> */}
      <div className="flex justify-center">
            <a
            onClick={() => dispatch(logIn())}
            className="text-blue-600 py-2 px-4 rounded mr-2 cursor-pointer hover:underline text-lg"
            >
          Login
        </a>
        <a
          onClick={() => dispatch(signUp())}
          className="text-green-600 py-2 px-4 rounded cursor-pointer hover:underline text-lg"
        >
          Sign-Up
        </a>
      </div>
    </>
  );
};

export default Tabs;
