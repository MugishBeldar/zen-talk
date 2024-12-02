/* eslint-disable react-hooks/exhaustive-deps */
import { createChat, getChatList, searchUser } from "@/api/api";
import { useDebounce } from "@/hooks";
import { chatList } from "@/store/chat-list/chat-list.action";
import { stateType } from "@/types/store";
import { userType } from "@/types/user";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

interface UseSearchControllerProps {
  socket: Socket;
}

const useSearchController = ({ socket }: UseSearchControllerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUsers, setSearchUsers] = useState<userType[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(searchQuery, 500);
  const user = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });

  
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim()) {
      (async () => {
        try {
          const users = await searchUser(debouncedQuery.toLowerCase());
          setSearchUsers(users.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      })();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleDocumentKeyDown = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [searchUsers, selectedIndex, showResults]);

  const handleKeyDown = async (e: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (searchUsers.length > 0 && showResults) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < searchUsers.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : searchUsers.length - 1
        );
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selectedUser = searchUsers[selectedIndex];
        setShowResults(false);
        setSearchQuery("");
        await creatUserChat(selectedUser);
      }
    }
  };

  const handleClick = async (clickedUser: userType) => {
    await creatUserChat(clickedUser);
    socket.emit("new chat user", user, clickedUser); // this event not gitting to all client why
    setShowResults(false);
    setSearchQuery("");
  };

  const creatUserChat = async (clickedUser: userType) => {
    try {
      const createChatBody = {
        userId: clickedUser._id,
      };
      const createdChatResponse = await createChat(createChatBody);
      const fetchChatListResponse = await getChatList();
      dispatch(chatList(fetchChatListResponse.data));
      if (createdChatResponse.data._id)
        navigate(`/${clickedUser._id}/chat/${createdChatResponse.data._id}`);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  return {
    handleClick,
    setSearchQuery,
    setShowResults,
    searchUsers,
    searchQuery,
    showResults,
    selectedIndex,
  };
};

export default useSearchController;
