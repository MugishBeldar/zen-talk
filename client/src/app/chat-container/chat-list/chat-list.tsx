import Search from "@/app/search/search";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useParams } from "react-router-dom";
import useChatListController from "./chat-list.controller";
import { useSelector } from "react-redux";
import { stateType } from "@/types/store";
import { ChatListType } from "@/types/user";
import { cn } from "@/lib/utils";
import { bufferToBase64, capitalizeNames, extractTime } from "@/utils";
import Spinner from "@/app/spinner/spinner";

const ChatList = () => {
  const { handleClick, isLoading } = useChatListController();
  const { chatId } = useParams();

  const chatList = useSelector((state: stateType) => {
    return state.chatListState.chatList;
  });
  const loggedUser = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });
  const screenSizes = useSelector((state: stateType) => {
    return state.screenSizeState;
  });

  return (
    <div className="w-full md:w-[400px] h-full rounded-xl px-4 flex flex-col">
      {/* Search Component */}
      <div className="pb-4">
        <Search />
      </div>

      {/* Chats Heading */}
      <div className="bg-secondary-white shadow-md rounded-t-xl p-2">
        {" "}
        {/* Added padding for spacing */}
        {chatList.length > 0 && (
          <p className="text-xl font-medium p-4">People</p>
        )}
        {/* Enhanced heading styles */}
      </div>

      {/* Scrollable Chat List Area */}
      <div className="flex-1 rounded-b-xl px-3 bg-secondary-white shadow-md overflow-y-auto custom-scrollbar">
        <ul className="h-full cursor-pointer">
          {loggedUser && chatList.length ? (
            chatList.map((chat: ChatListType) => {
              return (
                <div
                  key={chat._id}
                  onClick={() => handleClick(chat, loggedUser)}
                  className={cn(
                    "border-b flex hover:bg-primary-white",
                    chatId === chat._id && screenSizes.largeScreen
                      ? "bg-primary-white"
                      : null
                  )}
                >
                  <div className="flex flex-1">
                    <li
                      key={`chat-item-${chat._id}`}
                      // className=""
                      className={cn("flex items-center justify-between p-2")}
                    >
                      <div className="flex items-center">
                        {chat.users?.map(
                          (user) =>
                            loggedUser &&
                            loggedUser.id !== user._id && (
                              <Avatar className="pr-4 flex-shrink-0">
                                <AvatarImage
                                  key={`avatar-${chat._id}-${user._id}`}
                                  src={
                                    user.profilePic?.type === "Buffer"
                                      ? bufferToBase64(user.profilePic)
                                      : `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=eff6fc`
                                  }
                                  alt={`@${user.name}`}
                                  className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
                                />
                              </Avatar>
                            )
                        )}

                        {chat.users?.map(
                          (user) =>
                            loggedUser &&
                            loggedUser.id !== user._id && (
                              <div
                                // to={`/${user._id}/chat/${chat._id}`}
                                key={`user-${chat._id}-${user._id}`}
                                className="text-gray-800"
                              >
                                <div key={user._id}>
                                  <p className="text-[16px] font-medium">
                                    {capitalizeNames(user.name)}
                                  </p>
                                  <p className="text-[13px] leading-tight text-primary-gray line-clamp-1">
                                    {chat?.latestMessage?.content
                                      ? chat.latestMessage.content
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    </li>
                  </div>
                  <div className="text-gray-500 text-[13px] pt-2 pr-2 whitespace-nowrap">
                    <p>{extractTime(chat?.latestMessage?.updatedAt) || ""}</p>
                  </div>
                </div>
              );
            })
          ) : isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="flex  justify-center items-center h-full">
              <p className="text-xl mb-4 font-bold bg-gradient-to-r from-primary-violet to-primary-indigo bg-clip-text text-transparent">
                Please search and create chat.
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;
