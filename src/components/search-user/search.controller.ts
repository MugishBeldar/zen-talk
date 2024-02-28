import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {userTypes} from '../../types'
import useDebounce from "../../hooks/useDebounce";
import { chats } from "../../store/chats/chat.action";
import { getChatForAUser, searchUser } from "../../api/api";

interface searchUserTypes {
    setUsers: React.Dispatch<React.SetStateAction<userTypes[]>>
}

const useSearchController = ({setUsers}:searchUserTypes) => {

  const [searchvalue, setSearchValue] = useState<string>();
  let userAllChats = useSelector((state:any)=>state.chatState.chats);

  const debouncedValue = useDebounce(searchvalue, 1000);
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedValue) {
        try {
          const response = await searchUser(debouncedValue);
          if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
            const usersData: userTypes[] = response.data.data;
            setUsers(usersData);
          } else {
            console.error('Invalid response format:', response);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
  
    fetchUsers();
  }, [debouncedValue, setUsers]);
  


  const handleInputSearch = async (e: any) => {
      setSearchValue(e.target.value);
  };

  const clearSearchValue = () => {
    setSearchValue("");
  };

  const handleUserChange = async (event:any, selectedUser: userTypes | null) => {
    if (selectedUser) {
      clearSearchValue();
      const body = {
        userId: selectedUser._id,
      }
      const response = await getChatForAUser(body);
      const userSingleChat = response?.data?.data;
      if(!userAllChats.find((chat:any)=>chat._id === userSingleChat._id)){
        userAllChats = [userSingleChat, ...userAllChats];
        dispatch(chats(userAllChats));
      }
    }
  };

  return { handleInputSearch, clearSearchValue, handleUserChange };
};

export default useSearchController;
