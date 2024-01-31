import { Avatar, Box, Modal, Tooltip, Zoom } from "@mui/material";
import { userType } from "../../types";
import { useSelector } from "react-redux";
import { useState } from "react";
import Logout from "../logout/logout";
import Edit from "../edit/edit";
import Cookies from "js-cookie";
import useProfileController from "./profile.controller";

const Profile = () => {
  const [open, setOpen] = useState<boolean>(false);
  const editState = useSelector((state: any) => state.editState.edit);
  const buttonLoadingIndicator = useSelector(
    (state: any) => state.loadingIndicatorstate.clicked
  );
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
                  : `https://ui-avatars.com/api/?background=random&name=${userInfo.NAME}`
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
        <Box className="absolute w-[90%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 rounded-lg p-4 h-80  md:w-[65%] lg:w-[30%]">
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
                          : `https://ui-avatars.com/api/?background=random&name=${userInfo.NAME}`
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
                    <p className="text-sm">{userInfo.EMAIL}</p>
                  </div>
                  <div className="ml-10 sm:ml-auto md:ml-auto lg:ml-auto">
                    <Edit email={userInfo.EMAIL} name={userInfo.NAME} />
                    <Logout />
                  </div>
                </div>
                <div></div>
              </div>
              <div></div>
            </div>
          )}

          <form
            className={`mt-4 border shadow-sm ${
              editState ? "border-2 border-blue-500" : "border-slate-300"
            } border-slate-300 p-3 rounded-lg`}
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
                Name
              </span>
              <input
                disabled={!editState}
                required
                type="text"
                name="name"
                className="mb-3 mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
                placeholder="John Doe"
              />
            </label>

            <label htmlFor="" className="block">
              <span className="after:ml-0.5 after:text-red-500 block text-sm mb-1 font-medium text-slate-700">
                Profile Picture
              </span>
              <input
                name="profilePicture"
                disabled={!editState}
                type="file"
                className="block border shadow-sm border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded focus:ring-1 w-full text-sm mb-7 text-slate-500 file:mr-4 file:ml-3 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-500 hover:file:bg-blue-100 bottom-2 py-1"
              />
            </label>

            <div className="flex justify-end mt-[-10px]">
              <button
                disabled={!editState}
                type="submit"
                className={`px-4 py-1 ${
                  editState ? "bg-blue-500" : "bg-slate-400"
                } text-white rounded-md ${
                  editState
                    ? "hover:bg-blue-600"
                    : "bg-slate-400 cursor-not-allowed"
                }  focus:outline-none focus:ring focus:border-blue-300`}
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
