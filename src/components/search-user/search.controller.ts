import { useEffect, useState } from "react";
import { searchUser } from "../../api/api";
import useDebounce from "../../hooks/useDebounce";
import {userTypes} from '../../types'

interface searchUserTypes {
    setUsers: React.Dispatch<React.SetStateAction<userTypes[]>>
}

const useSearchController = ({setUsers}:searchUserTypes) => {

  const [searchvalue, setSearchValue] = useState<string>();
  const debouncedValue = useDebounce(searchvalue, 1000);

  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedValue) {
        try {
          const response = await searchUser(debouncedValue);
          console.log("🚀 ~ fetchUsers ~ response:", response)
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

  return { handleInputSearch };
};

export default useSearchController;
