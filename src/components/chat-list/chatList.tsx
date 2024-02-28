import React from "react";
import Cookies from "js-cookie";
import ScrollableFeed from "react-scrollable-feed";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { chatType, userType, userTypes } from "../../types";
import noChatFoundImage from '../../assets/noChatFound.png';
import { drawerToggle } from "../../store/drawer/drawer.action";

interface ChatListProps {
  setClickedUserFunction: React.Dispatch<
    React.SetStateAction<userTypes | null>
  >;
  setSelectedChatFunction: React.Dispatch<
    React.SetStateAction<chatType | null>
  >;
  clickedUser: userTypes | null;
  chatMaintain: boolean;
  selectedChat: chatType | null
}

const ChatList = ({
  setClickedUserFunction,
  setSelectedChatFunction,
  clickedUser,
}: ChatListProps) => {
  const allChats = useSelector((state: any) => state.chatState.chats);
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType = userInfoStringify && JSON.parse(userInfoStringify);
  const dispatch = useDispatch();

  const getSender = (loggedUser: userType, chat: chatType) => {
    if (chat?.users) {
      const senderName = chat?.users[0]?._id === loggedUser?.ID ? chat?.users[1]?.name : chat?.users[0]?.name;
      return (
        <div className="w-[100%] flex">
          <div className="flex-1">
            <p className="text-lg">{senderName?.charAt(0).toUpperCase() + senderName?.slice(1)}</p>
          </div>
        </div>)
    }
  };

  const getProfilePicture = (loggedUser: userType, users: userTypes[]) => {
    const selectedUser: userTypes[] = users.filter(
      (user) => user._id !== loggedUser.ID
    );
    return selectedUser[0]?.profilePic
      ? selectedUser[0].profilePic
      : `https://ui-avatars.com/api/?background=random&color=fff&name=${selectedUser[0]?.name}`;
  };

  const getSelectedUser = async (loggedUser: userType, chat: chatType) => {
    let selectedUser: userTypes[];
    if (chat.users) {
      selectedUser = chat.users.filter(
        (user) => user._id !== loggedUser.ID
      );
      setSelectedChatFunction(chat);
      setClickedUserFunction(selectedUser[0]);
      dispatch(drawerToggle(false))
    }
  };

  return (
    <div className="w-full bg-[whitesmoke] mt-5 rounded-lg ">
      <div className="flex h-15 bg-[whitesmoke] px-1 py-4 border-b-2 mb-3 border-mainBackgroundColor rounded">
        <p className="text-2xl ml-3 w-[65%]">My Chats</p>
      </div>

      <div className="bg-[whitesmoke] h-[79vh] rounded-lg">
        {!allChats.length && (<div className="h-[100%] flex items-center justify-center">
          <img src={noChatFoundImage} alt="no chat found" className="object-fill md:h-[60%] md:w-[70%] " />
        </div>)}
        <ScrollableFeed className="custom-scrollbar">
          {allChats &&
            allChats.map(
              (chat: chatType) =>
                chat &&
                chat.users && (
                  <li
                    onClick={() =>
                      chat.users ? getSelectedUser(loggedUser, chat) : null
                    }
                    key={chat._id}
                    className={`flex items-center p-2 hover:cursor-pointer ${chat.users[0]._id === clickedUser?._id || chat.users[1]._id === clickedUser?._id ? "border-l-4 border-[#075E54]" : null}`}
                  >
                    {chat.users && (
                      <Avatar
                        alt="Remy Sharp"
                        src={getProfilePicture(loggedUser, chat.users)}
                        sx={{ marginRight: "20px" }}
                      />
                    )}
                    {chat.users
                      ? getSender(loggedUser, chat)
                      : null}
                  </li>
                )
            )}
        </ScrollableFeed>
      </div>
    </div>
  );
};

export default ChatList;
