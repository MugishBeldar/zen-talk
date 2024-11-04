import { searchUser } from "@/api/api";
import { useDebounce } from "@/hooks";
import { userType } from "@/types/user";
import { useEffect, useState } from "react";

const useSearchController = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUsers, setSearchUsers] = useState<userType[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(true); // New state to control visibility

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim()) {
      console.log("Searching for:", debouncedQuery);

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

  // Handle arrow key navigation and Enter key
  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
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
        console.log("Selected user:", selectedUser);

        // Close the search results when Enter is pressed
        setShowResults(false);
        setSearchQuery("");

        // Optionally, you can add navigation logic here
        // window.location.href = `/user/${selectedUser.id}`;
      }
    }
  };

  return {
    setSearchQuery,
    setShowResults,
    searchUsers,
    searchQuery,
    showResults,
    selectedIndex,
  };
};

export default useSearchController;
