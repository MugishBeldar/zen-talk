import Search from "@/app/search/search";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";
import useChatListController from "./chat-list.controller";
import { useSelector } from "react-redux";
import { stateType } from "@/types/store";
import { ChatListType } from "@/types/user";

// interface ChatListProps {
//   chats: any;
// }

const ChatList = () => {
  const { extractTime } = useChatListController();

  // Accessing chat list and logged user state from the Redux store
  const chatList = useSelector(
    (state: stateType) => state.chatListState.chatList
  );
  const loggedUser = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );

  // Function to render the user section for each chat item
  const renderUserSection = (chat: ChatListType) => {
    return chat.users?.map((user) => {
      if (loggedUser && loggedUser.id !== user._id) {
        return (
          <div key={user._id} className="flex items-center gap-2 w-1/2">
            {/* Avatar section */}
            <Avatar className="pr-4 flex-shrink-0">
              <AvatarImage
                src={
                  user.profilePic
                    ? user.profilePic
                    : `https://ui-avatars.com/api/?name=${user.name}&background=random`
                }
                alt={`@${user.name}`}
                className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
              />
            </Avatar>
            {/* Chat link section */}
            <Link
              to={`/${user._id}/chat/${chat._id}`}
              className="text-gray-800 flex-grow"
            >
              <div className="w-full">
                <p className="text-[16px] font-medium truncate">{user.name}</p>
                <p className="text-[13px] leading-tight text-primary-gray line-clamp-1">
                  {chat.latestMessage.content}
                </p>
              </div>
            </Link>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="w-[400px] h-full rounded-xl px-4 flex flex-col">
      {/* Search Component */}
      <div className="pb-4">
        <Search />
      </div>

      {/* Chats Heading */}
      <div className="bg-secondary-white shadow-md rounded-t-xl p-2">
        <p className="text-xl font-medium p-4">People</p>
      </div>

      {/* Scrollable Chat List Area */}
      <div className="flex-1 rounded-b-xl px-3 bg-secondary-white shadow-md overflow-y-auto custom-scrollbar">
        <ul className="cursor-pointer">
          {/* Render chat list if available */}
          {chatList.length
            ? chatList.map((chat: ChatListType) => (
                <div
                  key={chat._id}
                  className="border-b flex hover:bg-primary-white p-2"
                >
                  {/* Render user details for each chat */}
                  {renderUserSection(chat)}
                  {/* Display the time of the latest message */}
                  <div className="text-gray-500 text-[13px] pt-2 pr-2 flex-1 flex justify-end gap-1">
                    <p>
                      {extractTime(chat.latestMessage.createdAt).split(" ")[0] +
                        ","}
                    </p>
                    <p>
                      {extractTime(chat.latestMessage.createdAt).split(" ")[1] +
                        " " +
                        extractTime(chat.latestMessage.createdAt).split(" ")[2]}
                    </p>
                  </div>
                </div>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;

// const ChatList = ({ chats }: ChatListProps) => {
//   const { extractTime } = useChatListController();

//   const chatList = useSelector((state: stateType) => {
//     return state.chatListState.chatList;
//   });
//   const loggedUser = useSelector((state: stateType) => {
//     return state.loggedUserState.loggedUser;
//   });
//   console.log(loggedUser);
//   console.log(chatList);
//   return (
//     <div className="w-[400px] h-full rounded-xl px-4 flex flex-col">
//       {/* Search Component */}
//       <div className="pb-4">
//         <Search />
//       </div>

//       {/* Chats Heading */}
//       <div className="bg-secondary-white shadow-md rounded-t-xl p-2">
//         {" "}
//         {/* Added padding for spacing */}
//         <p className="text-xl font-medium p-4">People</p>{" "}
//         {/* Enhanced heading styles */}
//       </div>

//       {/* Scrollable Chat List Area */}
//       <div className="flex-1 rounded-b-xl px-3 bg-secondary-white shadow-md overflow-y-auto custom-scrollbar">
//         <ul className="cursor-pointer">
//           {Array(20) // Placeholder for chat items
//             .fill(0)
//             .map((_, index) => (
//               <div className="border-b">
//                 <li
//                   key={index} // Change this to chats[index].id for actual data
//                   className="flex items-center justify-between p-2 hover:bg-primary-white"
//                 >
//                   <div className="flex items-center">
//                     {/* <User className="w-6 h-6 text-gray-500 mr-3" /> */}
//                     <Avatar className="pr-4">
//                       <AvatarImage
//                         src="https://github.com/shadcn.png"
//                         alt="@shadcn"
//                         className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
//                       />
//                       {/* <AvatarFallback>CN</AvatarFallback> */}
//                     </Avatar>
//                     <Link
//                       to={`/${chats[0].userId}/chat/${chats[0].id}`}
//                       className="text-gray-800"
//                     >
//                       {chats[0].name} {/* Replace with actual data */}
//                     </Link>
//                   </div>

//                   <span className="text-gray-500 text-sm">12:45 PM</span>
//                 </li>
//               </div>
//             ))}
//           {chatList.length
//             ? chatList.map((chat: ChatListType) => {
//                 return (
//                   <div className="border-b flex hover:bg-primary-white">
//                     <li
//                       key={chat._id}
//                       className="flex items-center justify-between p-2 "
//                     >
//                       <div className="flex items-center">
//                         {chat.users?.map(
//                           (user) =>
//                             loggedUser &&
//                             loggedUser.id !== user._id && (
//                               <Avatar className="pr-4">
//                                 <AvatarImage
//                                   src={
//                                     user?.profilePic
//                                       ? user.profilePic
//                                       : `https://ui-avatars.com/api/?name=${user?.name}&background=random`
//                                   }
//                                   alt="@shadcn"
//                                   className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
//                                 />
//                               </Avatar>
//                             )
//                         )}

//                         {chat.users?.map(
//                           (user) =>
//                             loggedUser &&
//                             loggedUser.id !== user._id && (
//                               <Link
//                                 to={`/${user._id}/chat/${chat._id}`}
//                                 className="text-gray-800"
//                               >
//                                 <div key={user._id}>
//                                   <p className="text-[16px] font-medium">
//                                     {user.name}
//                                   </p>
//                                   <p className="text-[13px] leading-tight text-primary-gray">
//                                     {chat.latestMessage.content}
//                                   </p>
//                                 </div>
//                               </Link>
//                             )
//                         )}
//                       </div>
//                     </li>
//                     <div className="text-gray-500 text-[13px] pt-3 pr-2 flex-1 flex justify-end gap-1">
//                       <p>
//                         {extractTime(chat.latestMessage.createdAt).split(
//                           " "
//                         )[0] + ","}
//                       </p>
//                       <p>
//                         {extractTime(chat.latestMessage.createdAt).split(
//                           " "
//                         )[1] +
//                           " " +
//                           extractTime(chat.latestMessage.createdAt).split(
//                             " "
//                           )[2]}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })
//             : null}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ChatList;
