import useChatAreaController from "./chat-area.controller";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { bufferToBase64, capitalizeNames, extractTime } from "@/utils";
import { EllipsisVertical } from "lucide-react";
import { MessageType } from "@/types/user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";
import noMsgGif from "../../../assets/no-message.gif";
import Spinner from "@/app/spinner/spinner";
import { ChevronLeft } from "lucide-react";
interface ChateAreaProps {
  socket: Socket;
}

const ChatArea = ({ socket }: ChateAreaProps) => {
  const {
    conversation,
    reciverUser,
    handleSendMessage,
    setNewMessage,
    newMessage,
    lastMessageRef,
    handleBack,
    onlineUsersState,
    user,
    isSpinner,
    screenSizes,
  } = useChatAreaController({ socket });

  return (
    <div
      className={cn("h-full flex flex-col rounded-xl pl-2 pr-1 shadow-md py-2")}
    >
      {!isSpinner && reciverUser && conversation && (
        <>
          <div className="border-b gap-1 flex pb-2 justify-center items-center">
            <div
              onClick={handleBack}
              className={
                screenSizes.smallScreen
                  ? cn("text-primary-violet cursor-pointer")
                  : cn("hidden")
              }
            >
              <ChevronLeft size={30} />
            </div>
            <div className="flex gap-4 items-center flex-1">
              <Avatar className="relative">
                <AvatarImage
                  src={
                    reciverUser?.profilePic?.type === "Buffer"
                      ? bufferToBase64(reciverUser?.profilePic)
                      : `https://ui-avatars.com/api/?name=${reciverUser?.name}&background=7c3aed&color=eff6fc`
                  }
                  alt={`@${reciverUser?.name}`}
                  className="rounded-full cursor-pointer w-12 h-12"
                />
                {onlineUsersState &&
                  onlineUsersState.includes(reciverUser._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary-white rounded-full"></span>
                  )}
              </Avatar>
              <div className="flex flex-col justify-center">
                <p>{reciverUser && capitalizeNames(reciverUser?.name)}</p>
                <p className="text-xs text-primary-gray">
                  {onlineUsersState &&
                  onlineUsersState.includes(reciverUser._id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>
            <EllipsisVertical className="text-primary-indigo" />
          </div>
          <div className="flex-1 flex flex-col gap-y-4 overflow-y-auto custom-scrollbar">
            {conversation.length ? (
              conversation.map((msg: MessageType) => {
                return (
                  <div key={msg._id} className="flex flex-col my-2">
                    <div
                      className={cn(
                        msg.sender._id === user?.id
                          ? "bg-violet-400 self-end text-secondary-white"
                          : "bg-gray-200 self-start",
                        "p-2 mr-1 rounded-xl max-w-[75%]"
                      )}
                    >
                      <pre className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </pre>
                    </div>
                    <div
                      className={cn(
                        msg.sender._id === user?.id
                          ? "self-end mt-1"
                          : "self-start mt-1",
                        "text-[11px] text-gray-500"
                      )}
                    >
                      {extractTime(msg.updatedAt)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center flex-1 flex-col">
                <p className="text-2xl mb-4 font-bold bg-gradient-to-r from-primary-violet to-primary-indigo bg-clip-text text-transparent">
                  No message yet.
                </p>
                <img src={noMsgGif} alt="No messages" className="" />
              </div>
            )}
            <div ref={lastMessageRef} />
          </div>
          {/* Message textarea and send button */}
          <div className="flex border-t mt-2 pt-2">
            <div className="flex-1">
              <textarea
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                value={newMessage}
                placeholder="Type your message..."
                id="myTextarea"
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingTop: "10px",
                  boxSizing: "border-box",
                }}
                className="flex items-center scrollbar-none text-area w-full border overflow-y-auto rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary-indigo"
              ></textarea>
            </div>
            <div>
              <Button
                className="ml-2 bg-primary-indigo text-primary-white text-lg rounded-lg hover:bg-secondary-indigo focus:ring-2 focus:ring-secondary-indigo"
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </div>
          </div>
        </>
      )}
      {isSpinner && (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
