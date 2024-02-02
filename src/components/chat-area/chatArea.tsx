import React from "react";
import { Avatar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { userTypes } from "../../types";

interface ChatAreaProps {
  clickedUser: userTypes | null
}

const ChatArea = ({clickedUser}: ChatAreaProps) => {
  return (
    <div className="flex flex-col flex-grow bg-white rounded-lg">
      {clickedUser && (
        <div className="flex bg-white p-2 mb-2 border-b-2 rounded-lg">
          <div className="text-2xl ml-3 w-[65%] text-gray-500">
            {clickedUser && (
              <div className="flex items-center">
                <Avatar
                  alt="Remy Sharp"
                  src={
                    clickedUser.profilePic
                      ? clickedUser.profilePic
                      : `https://ui-avatars.com/api/?background=random&name=${clickedUser.name}`
                  }
                  sx={{ marginRight: "20px", width: "50px", height: "50px" }}
                />
                <p>
                  {clickedUser.name.charAt(0).toUpperCase() +
                    clickedUser.name.slice(1)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {/* Messages go here */}
        <h1>messages</h1>
      </div>
      <div className="flex items-center border-t-2">
        <input
          type="text"
          className="min-w-10 flex-1 inline m-2 p-[2%]  bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500  rounded-md sm:text-sm focus:ring-1 md:p-2"
          placeholder="Type your message..."
        />

        <button className="p-[2%] rounded-lg bg-blue-500 text-white hover:bg-blue-700 md:px-4 md:py-2">
          😀 Emoji
        </button>

        <button className="mx-2 p-[2%] rounded-lg bg-green-500 text-white hover:bg-green-700  md:px-4 md:py-2">
          <SendIcon
            fontSize="small"
            className="mr-1 flex items-center mt-[-2px ]"
          />
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
