import Cookies from "js-cookie";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Box, Modal, Tooltip, Zoom } from "@mui/material";

import Edit from "../edit/edit";
import Logout from "../logout/logout";
import { userType } from "../../types";
import useProfileController from "./profile.controller";

const Profile = () => {
  const [open, setOpen] = useState<boolean>(false);
  const editState = useSelector((state: any) => state.editState.edit);
  const buttonLoadingIndicator = useSelector((state: any) => state.loadingIndicatorstate.clicked);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const userInfo: userType = userInfoStringify && JSON.parse(userInfoStringify);
  const { handleSubmit, handleOpen, handleClose } = useProfileController({
    userInfo,
    setOpen,
  });

  return (
    <>
      <Tooltip title="Profile" placement="top" TransitionComponent={Zoom} arrow>
        <div className="cursor-pointer">
          {userInfo && (
            <Avatar
              onClick={handleOpen}
              alt={userInfo!.NAME}
              src={
                userInfo.PROFILEPIC
                  ? userInfo.PROFILEPIC
                  : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${userInfo.NAME}`
              }
            />
          )}
        </div>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box className="absolute w-[90%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[whitesmoke] rounded-lg p-4 h-80  md:w-[65%] lg:w-[30%]">
          {userInfo && (
            <div>
              <div>
                <div className="flex items-center">
                  <div className="mr-4">
                    <Avatar
                      onClick={handleOpen}
                      alt={userInfo!.NAME}
                      src={
                        userInfo.PROFILEPIC
                          ? userInfo.PROFILEPIC
                          : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${userInfo.NAME}`
                      }
                      sx={{
                        width: 60,
                        height: 60,
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold">
                      {userInfo.NAME.charAt(0).toUpperCase() +
                        userInfo.NAME.slice(1)}
                    </p>
                    <p className="text-sm text-[gray] ">{userInfo.EMAIL}</p>
                  </div>
                  <div className="ml-10 sm:ml-auto md:ml-auto lg:ml-auto">
                    <Edit email={userInfo.EMAIL} name={userInfo.NAME} />
                    <Logout />
                  </div>
                </div>
              </div>
            </div>
          )}

          <form
            className={`mt-4 border shadow-sm ${editState ? "border border-[#040404]" : "border-[#cccaca]"
              } border-[#7e7e7e] p-3 rounded-lg`}
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span
                className={`after:content-['*'] after:ml-0.5 ${editState
                  ? "after:text-[#040404] text-[#040404]"
                  : "after:text-[#7e7e7e] text-[#7e7e7e]"
                  } block text-sm font-medium `}
              >
                Name
              </span>
              <input
                disabled={!editState}
                required
                type="text"
                name="name"
                // className="mb-3 mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
                className={`mb-3 mt-1 px-3 py-2 bg-[whitesmoke] border shadow-sm ${editState ? "border-[#777676] " : "border-[#cccaca]"
                  } border-[#040404] placeholder-slate-400 focus:outline-none focus:border-[#040404]  block w-full rounded-md sm:text-sm `}
                placeholder="John Doe"
              />
            </label>

            <label htmlFor="" className="block">
              <span
                className={` mb-1 after:ml-0.5 ${editState
                  ? "after:text-[#040404] text-[#040404]"
                  : "after:text-[#7e7e7e] text-[#7e7e7e]"
                  } block text-sm font-medium `}
              >
                Profile Picture
              </span>
              <input
                name="profilePicture"
                disabled={!editState}
                type="file"
                className={`block border shadow-sm border-slate-300 focus:outline-none ${editState
                  ? "border-[#777676] file:text-[#777676]"
                  : "border-[#cccaca] file:text-[#cccaca]"
                  } rounded w-full text-sm mb-7 text-slate-400 file:mr-4 file:ml-3 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200  hover:file:bg-blue-100 bottom-2 py-1`}
              />
            </label>

            <div className="flex justify-end mt-[-10px]">
              <button
                disabled={!editState}
                type="submit"
                className={`px-4 py-1 ${editState ? "bg-buttonColor" : "bg-slate-200"
                  } text-[#fff] rounded-md ${editState ? "hover:bg-hoverButtonColor" : " cursor-not-allowed"
                  }`}
              >
                Submit
                {buttonLoadingIndicator ? (
                  <img
                    className="inline ml-2"
                    src={require("../../assets/Spinner-1s-200px.gif")}
                    alt="loading..."
                    width={25}
                  />
                ) : null}
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Profile;
