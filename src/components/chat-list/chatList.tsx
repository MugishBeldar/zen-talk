import React from "react";
import AddIcon from "@mui/icons-material/Add";
import Cookies from "js-cookie";
import ScrollableFeed from "react-scrollable-feed";
import { Avatar, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { chatType, userType, userTypes } from "../../types";
import noChatFoundImage from '../../assets/noChatFound.png';

// ...
interface ChatListProps {
  setClickedUserFunction: React.Dispatch<
    React.SetStateAction<userTypes | null>
  >;
  setSelectedChatFunction: React.Dispatch<
    React.SetStateAction<chatType | null>
  >;
  clickedUser: userTypes | null;
}

const ChatList = ({
  setClickedUserFunction,
  setSelectedChatFunction,
  clickedUser
}: ChatListProps) => {
  const chats = useSelector((state: any) => state.chatState.chats);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType = userInfoStringify && JSON.parse(userInfoStringify);

  const getSender = (loggedUser: userType, users: userTypes[]) => {
    const senderName = users[0]?._id === loggedUser?.ID ? users[1]?.name : users[0]?.name;
    return senderName?.charAt(0).toUpperCase() + senderName?.slice(1);
  };

  const getProfilePicture = (loggedUser: userType, users: userTypes[]) => {
    const selectedUser: userTypes[] = users.filter(
      (user) => user._id !== loggedUser.ID
    );
    return selectedUser[0]?.profilePic
      ? selectedUser[0].profilePic
      : `https://ui-avatars.com/api/?background=000000&color=ffffff&name=${selectedUser[0]?.name}`;
  };

  const getSelectedUser = (loggedUser: userType, chat: chatType) => {
    if (chat.users) {
      const selectedUser: userTypes[] = chat.users.filter(
        (user) => user._id !== loggedUser.ID
      );
      setClickedUserFunction(selectedUser[0]);
      setSelectedChatFunction(chat);
    }
  };

  return (
    <div className="w-full bg-[#e4e4e4] mt-5 rounded-lg ">
      <div className="flex h-15 bg-[#e4e4e4] px-1 py-4 border-2 mb-1 shadow-lg  rounded-lg">
        <p className="text-2xl ml-3 w-[65%] text-[#040404]">My Chats</p>
        {/* <Button
          sx={{ backgroundColor: "#040404", fontWeight: "bold", ":hover": { backgroundColor: "#7e7e7e" } }}
          variant="contained"
          size="small"
          className="ml-auto"
        >
          Create group <AddIcon className="ml-[2px]" />
        </Button> */}
      </div>

      <div className="bg-[#e4e4e4] h-[79vh] rounded-lg">
        {!chats.length && (<div className="h-[100%] flex items-center justify-center">
          <img src={noChatFoundImage} alt="no chat found" className="object-fill md:h-[60%] md:w-[70%] " />
        </div>)}
        <ScrollableFeed className="custom-scrollbar">
          {chats &&
            chats.map(
              (chat: chatType) =>
                chat &&
                chat.users && (
                  <li
                    onClick={() =>
                      chat.users ? getSelectedUser(loggedUser, chat) : null
                    }
                    key={chat._id}
                    className={`flex items-center m-2 p-2 hover:bg-[#7e7e7e] hover:text-white hover:rounded-lg ${chat.users[0]._id === clickedUser?._id || chat.users[1]._id === clickedUser?._id ? "bg-[#7e7e7e] rounded-lg text-white" : null}`}
                  >
                    {chat.users && (
                      <Avatar
                        alt="Remy Sharp"
                        src={getProfilePicture(loggedUser, chat.users)}
                        sx={{ marginRight: "20px" }}
                      />
                    )}
                    {!chat.isGroupChat && chat.users
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </li>
                )
            )}
        </ScrollableFeed>
      </div>
    </div>
  );
};

export default ChatList;
