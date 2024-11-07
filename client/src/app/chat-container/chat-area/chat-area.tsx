/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import useChatAreaController from "./chat-area.controller";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { capitalizeNames, extractTime } from "@/utils";
import { EllipsisVertical } from "lucide-react";
import { MessageType } from "@/types/user";
import { stateType } from "@/types/store";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Socket } from "socket.io-client";

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
  } = useChatAreaController({ socket });
  const user = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });


  // Scroll to the bottom when a new message is added
  // This effect runs every time the conversation updates

  return (
    <div className="h-full flex flex-col rounded-xl pl-2 pr-1 shadow-md py-2">
      {reciverUser && conversation && (
        <>
          <div className="border-b flex pb-2 justify-center items-center">
            <div className="flex gap-4 items-center flex-1">
              <Avatar>
                <AvatarImage
                  src={
                    reciverUser?.profilePic
                      ? reciverUser?.profilePic
                      : `https://ui-avatars.com/api/?name=${reciverUser?.name}&background=7c3aed&color=eff6fc`
                  }
                  alt={`@${reciverUser?.name}`}
                  className="rounded-full cursor-pointer w-12 h-12"
                />
              </Avatar>
              <p>{reciverUser && capitalizeNames(reciverUser?.name)}</p>
            </div>
            <EllipsisVertical className="text-primary-indigo" />
          </div>
          <div className="flex-1 flex flex-col gap-y-4 overflow-y-auto custom-scrollbar">
            {conversation.map((msg: MessageType) => (
              <div key={msg._id} className="flex flex-col my-2">
                <div
                  className={cn(
                    msg.sender._id === user?.id
                      ? "bg-violet-400 self-end text-secondary-white"
                      : "bg-gray-200 self-start",
                    "p-2 mr-1 rounded-3xl max-w-[75%]"
                  )}
                >
                  <p>{msg.content}</p>
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
            ))}
          <div ref={lastMessageRef} />
          </div>
          {/* Message input and send button */}
          <div className="flex border-t mt-2 pt-2">
            <div className="flex-1">
              <Input
                type="text"
                className=" p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
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
    </div>
  );
};

export default ChatArea;
