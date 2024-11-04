/* eslint-disable @typescript-eslint/no-explicit-any */
import Search from "@/app/search/search";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";

interface ChatListProps {
  chats: any;
}

const ChatList = ({ chats }: ChatListProps) => {
  return (
    <div className="w-[400px] h-full rounded-xl px-4 flex flex-col">
      {/* Search Component */}
      <div className="pb-4">
        <Search />
      </div>

      {/* Chats Heading */}
      <div className="bg-secondary-white shadow-md rounded-t-xl p-2">
        {" "}
        {/* Added padding for spacing */}
        <p className="text-xl font-medium p-4">People</p>{" "}
        {/* Enhanced heading styles */}
      </div>

      {/* Scrollable Chat List Area */}
      <div className="flex-1 rounded-b-xl px-3 bg-secondary-white shadow-md overflow-y-auto custom-scrollbar">
        <ul className="cursor-pointer">
          {Array(20) // Placeholder for chat items
            .fill(0)
            .map((_, index) => (
              <div className="border-b">
                <li
                  key={index} // Change this to chats[index].id for actual data
                  className="flex items-center justify-between p-2 hover:bg-primary-white"
                >
                  <div className="flex items-center">
                    {/* <User className="w-6 h-6 text-gray-500 mr-3" /> */}
                    <Avatar className="pr-4">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                        className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
                      />
                      {/* <AvatarFallback>CN</AvatarFallback> */}
                    </Avatar>
                    <Link
                      to={`/${chats[0].userId}/chat/${chats[0].id}`}
                      className="text-gray-800"
                    >
                      {chats[0].name} {/* Replace with actual data */}
                    </Link>
                  </div>

                  <span className="text-gray-500 text-sm">12:45 PM</span>
                </li>
              </div>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;
