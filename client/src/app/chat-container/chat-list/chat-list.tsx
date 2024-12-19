import Search from "@/app/search/search";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import useChatListController from "./chat-list.controller";
import { ChatListType } from "@/types/user";
import { cn } from "@/lib/utils";
import { bufferToBase64, capitalizeNames, extractTime } from "@/utils";
import Spinner from "@/app/spinner/spinner";
import { Socket } from "socket.io-client";
import { Trash2 } from "lucide-react";
import { DeleteModal } from "@/app/modals";

interface ChatListProps {
  socket: Socket;
}

const ChatList = ({ socket }: ChatListProps) => {
  const {
    handleClick,
    isLoading,
    setDeleteModel,
    deleteModel,
    chatId,
    path,
    userChatList,
    loggedUser,
    screenSizes,
    setIdForDeleteChat,
    deleteChat,
    idForDeleteChat,
    onlineUsersState,
  } = useChatListController({ socket });

  return (
    <div
      className={cn(
        screenSizes.smallScreen && path.pathname.split("/").length === 4
          ? "hidden"
          : "w-full md:w-[400px] h-full rounded-xl px-4 flex flex-col"
      )}
    >
      {/* Search Component */}
      <div className="pb-4">
        <Search socket={socket} />
      </div>

      {/* Chats Heading */}
      <div className="bg-secondary-white shadow-md rounded-t-xl p-2">
        {" "}
        {/* Added padding for spacing */}
        {userChatList.length > 0 && (
          <p className="text-xl font-medium p-4">People</p>
        )}
        {/* Enhanced heading styles */}
      </div>

      {/* Scrollable Chat List Area */}
      <div className="flex-1 rounded-b-xl px-3 bg-secondary-white shadow-md overflow-y-auto custom-scrollbar">
        <ul className="h-full cursor-pointer">
          {loggedUser && userChatList.length ? (
            userChatList.map((chat: ChatListType) => {
              return (
                <div
                  key={chat._id}
                  onClick={() => handleClick(chat, loggedUser)}
                  className={cn(
                    "group border-b flex hover:bg-primary-white",
                    chatId === chat._id && screenSizes.largeScreen
                      ? "bg-primary-white"
                      : null
                  )}
                >
                  <div className="flex flex-1">
                    <li
                      className={cn("flex items-center justify-between p-2")}
                    >
                      <div className="flex items-center">
                        {chat.users?.map(
                          (user) =>
                            loggedUser &&
                            loggedUser.id !== user._id && (
                              <Avatar key={`avatar-${chat._id}-${user._id}`} className="relative z-10 pr-4 flex-shrink-0">
                                <AvatarImage

                                  src={
                                    user.profilePic?.type === "Buffer"
                                      ? bufferToBase64(user.profilePic)
                                      : `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=eff6fc`
                                  }
                                  alt={`@${user.name}`}
                                  className="rounded-full border-2 border-primary-white cursor-pointer w-12 h-12"
                                />
                                {onlineUsersState &&
                                  onlineUsersState.includes(user._id) && (
                                    <span className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 border-2 border-primary-white rounded-full"></span>
                                  )}
                              </Avatar>
                            )
                        )}

                        {chat.users?.map(
                          (user) =>
                            loggedUser &&
                            loggedUser.id !== user._id && (
                              <div
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
                  <div className="flex flex-col justify-center gap-2 text-gray-500 text-[13px] pr-2 whitespace-nowrap group-hover:visible">
                    <p>{extractTime(chat?.latestMessage?.updatedAt)}</p>
                    <p
                      className={cn(
                        screenSizes.smallScreen
                          ? "hidden"
                          : "invisible group-hover:visible text-primary-red flex justify-end"
                      )}
                    >
                      <Trash2
                        onClick={(e) => {
                          // Prevent event bubbling
                          e.stopPropagation();
                          setDeleteModel(true);
                          setIdForDeleteChat(chat._id);
                        }}
                        size={18}
                      />
                    </p>
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
      <DeleteModal
        deleteFunction={deleteChat}
        isOpenModal={deleteModel}
        setIsOpenModal={setDeleteModel}
        id={idForDeleteChat}
      />
    </div>
  );
};

export default ChatList;
