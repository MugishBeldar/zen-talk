import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import useSearchController from "./search.contrller";

const Search = () => {
  const {
    setSearchQuery,
    searchUsers,
    searchQuery,
    setShowResults,
    showResults,
    selectedIndex,
    handleClick,
  } = useSearchController();

  return (
    <div className="relative">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray cursor-pointer" />
        <Input
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          value={searchQuery}
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-2 py-2 text-lg shadow-md border border-secondary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
        />
      </div>
      {showResults && searchUsers.length && searchQuery.length > 2 ? (
        <div className="absolute px-3 mt-2 w-full max-h-60 overflow-y-auto bg-secondary-white shadow-md rounded-lg custom-scrollbar">
          <ul className="divide-y divide-gray-200 my-1">
            {searchUsers.map((user, index) => (
              <li
                onClick={() => {
                  handleClick(user);
                }}
                key={index}
                className={`flex items-center justify-between p-2 cursor-pointer ${
                  index === selectedIndex
                    ? "bg-primary-white"
                    : "hover:bg-primary-white"
                }`}
              >
                <div className="flex items-center">
                  <Avatar className="pr-4">
                    <AvatarImage
                      src={
                        user?.profilePic
                          ? user.profilePic
                          : `https://ui-avatars.com/api/?name=${user?.name}&background=7c3aed&color=eff6fc`
                      }
                      alt="@shadcn"
                      className="rounded-full w-11 h-11"
                    />
                  </Avatar>
                  <p>{user.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Search;
