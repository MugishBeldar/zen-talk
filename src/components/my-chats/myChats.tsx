import React from "react";
import useMyChatsContrller from "./myChats.controller";
import { chatType, userType, userTypes } from "../../types";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Avatar, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const MyChats = () => {
  const [chatss, setChats] = React.useState<chatType[]>([]);
  const chats = useSelector((state: any) => state.chatState.chats);
  // console.log("🚀 ~ MyChats ~ chats:", chats);
  const { fetchChats } = useMyChatsContrller({ setChats });
  const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
  const loggedUser: userType =
    userInfoStringify && JSON.parse(userInfoStringify);

  React.useEffect(() => {
    fetchChats();
  }, []);

  const getSender = (loggedUser: userType, users: userTypes[]) => {
    const senderName =
      users[0]?._id === loggedUser?.ID ? users[1].name : users[0].name;
    return senderName.charAt(0).toUpperCase() + senderName.slice(1);
  };

  const getProfilePicture = (loggedUser: userType, users: userTypes[]) => {
    const selectedUser:any = users.filter(user => user._id !== loggedUser.ID)
    return selectedUser[0].profilePic ? selectedUser[0].profilePic :  `https://ui-avatars.com/api/?background=random&name=${selectedUser[0].name}`;
  }

  return (
    <div className="flex h-auto my-3 border-2 rounded-lg">
      <div className="w-[30%] p-4 border-2 rounded-xl">
        <div className="flex bg-white p-2 mb-2 border-2 rounded-lg">
          <p className="text-2xl ml-3 w-[65%] text-gray-500">My Chats</p>
          <Button
            sx={{ backgroundColor: "blue", fontWeight: "bold" }}
            variant="contained"
            size="small"
          >
            Create group <AddIcon className="ml-[2px]" />
          </Button>
        </div>

        <div className="bg-white h-[79vh] border-2 rounded-lg ">
          <ul className="overflow-scroll h-full no-scrollbar">
            {chats &&
              chats.map((chat: chatType) => (
                <li key={chat._id} className="h-[6vh] flex items-center mx-2 px-2 hover:bg-blue-100 hover:rounded-lg">
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
              ))}
          </ul>
        </div>
      </div>
      <div className="w-[70%] h-[63%]p-4 border-2 rounded-xl">full chat section</div>
    </div>
  );
};

export default MyChats;

// const userInfoStringify: string | undefined = Cookies.get("USER_INFO");
// const loggedUser: userType = userInfoStringify && JSON.parse(userInfoStringify);
