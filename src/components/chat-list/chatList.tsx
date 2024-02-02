import { Avatar, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import React from "react";
import { useSelector } from "react-redux";
import { chatType, userType, userTypes } from "../../types";
import Cookies from "js-cookie";

interface ChatListProps {
  setClickedUserFunction: React.Dispatch<
    React.SetStateAction<userTypes | null>
  >;
  setSelectedChatFunction: React.Dispatch<
    React.SetStateAction<chatType | null>
  >;
}

const ChatList = ({
  setClickedUserFunction,
  setSelectedChatFunction,
}: ChatListProps) => {
  const chats = useSelector((state: any) => state.chatState.chats);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType =
    userInfoStringify && JSON.parse(userInfoStringify);
  const getSender = (loggedUser: userType, users: userTypes[]) => {
    const senderName =
      users[0]?._id === loggedUser?.ID ? users[1].name : users[0].name;
    return senderName.charAt(0).toUpperCase() + senderName.slice(1);
  };

  const getProfilePicture = (loggedUser: userType, users: userTypes[]) => {
    const selectedUser: userTypes[] = users.filter(
      (user) => user._id !== loggedUser.ID
    );
    return selectedUser[0].profilePic
      ? selectedUser[0].profilePic
      : `https://ui-avatars.com/api/?background=random&name=${selectedUser[0].name}`;
  };

  const getSelectedUser = (loggedUser: userType, chat: chatType) => {
    // console.log(loggedUser, "loogedUser");
    // console.log('chating user,', users);
    if (chat.users) {
      const selectedUser: userTypes[] = chat.users.filter(
        (user) => user._id !== loggedUser.ID
      );
      setClickedUserFunction(selectedUser[0]);
      setSelectedChatFunction(chat);
    }
  };
  return (
    <>
      <div className="flex bg-white px-2 py-4 mb-2 border-2 rounded-lg ">
        <p className="text-2xl ml-3 w-[65%] text-gray-500">My Chats</p>
        <Button
          sx={{ backgroundColor: "Blue", fontWeight: "bold" }}
          variant="contained"
          size="small"
        >
          Create group <AddIcon className="ml-[2px]" />
        </Button>
      </div>

      <div className="bg-white h-[79vh] border-2 rounded-lg ">
        <ul className="overflow-scroll h-full no-scrollbar">
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
                    className="h-[6vh] flex items-center mx-2 px-2 hover:bg-blue-100 hover:rounded-lg"
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
        </ul>
      </div>
    </>
  );
};

export default ChatList;
