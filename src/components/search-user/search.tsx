/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import searchController from "./search.controller";
import { userTypes } from "../../types";
import { Autocomplete } from "@mui/material";
import {useDispatch, useSelector} from 'react-redux';
import { getChatForAUser } from "../../api/api";
import { chats } from "../../store/chats/chat.action";
import { styled } from "@mui/material/styles";

const CustomeTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#040404",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#040404",
    },
    "&:hover fieldset": {
      borderColor: "#040404",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#040404",
    },
  },
});

const SearchUser = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState<userTypes[]>([]);
  console.log("🚀 ~ SearchUser ~ users:", users)
  const { handleInputSearch, clearSearchValue } = searchController({ setUsers });
  const [selectedChat, setSelectedChat] = useState<userTypes>();
  let userAllChats = useSelector((state:any)=>state.chatState.chats);
  // console.log("user all chats ", userAllChats);   

  const handleUserChange = async (event: any, selectedUser: userTypes | null) => {
    if (selectedUser) {
      // console.log("Selected User:", selectedUser);
      setSelectedChat(selectedUser);
      clearSearchValue();
      const body = {
        userId: selectedUser._id,
        
      }
      const response = await getChatForAUser(body);
      // console.log("🚀 ~ handleUserChange ~ response:", response)
      const userSingleChat = response?.data?.data;
      // console.log('single user chat', userSingleChat);
      if(!userAllChats.find((chat:any)=>chat._id === userSingleChat._id)){
        // console.log('inside if condition')
        userAllChats = [userSingleChat, ...userAllChats];
        dispatch(chats(userAllChats));
      }
    }
  };

  return (
    <div className=" w-40 sm:w-80 bg-[#e4e4e4]">
      <Autocomplete
        freeSolo
        size="small"
        onInputChange={handleInputSearch}
        disableClearable
        options={users.map((user) => user)}
        //@ts-ignore
        onChange={handleUserChange}
        //@ts-ignore
        getOptionLabel={(user) => user.name}
        renderInput={(params) => (
          <CustomeTextField
            {...params}
            label="Search user"
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
            sx={{
              backgroundColor:"#e4e4e4"
            }}
          />
        )}
        renderOption={(props, user: userTypes) => 
          (
          <li {...props} className="ml-3 mb-2">
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={
                  user.profilePic
                    ? user.profilePic
                    : `https://ui-avatars.com/api/?background=000000&color=ffffff&name=${user.name}`
                }
                alt={`Image for ${user.name}`}
                style={{
                  borderRadius: "50%",
                  marginRight: "8px",
                  width: "50px",
                  height: "50px",
                }}
              />
              {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
            </div>
          </li>
        )}
      />
    </div>
  );
};

export default SearchUser;
