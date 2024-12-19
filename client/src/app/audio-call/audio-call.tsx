// import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
// import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
// import { CallModel } from "../modals";
import { useDispatch } from "react-redux";
import { setOpenCallModal } from "@/store/call-model/call-model.action";
import { setCallState } from "@/store/call-state/call-state-action";

interface AudioCallProps {
  socket: Socket;
  receiverId: string;
}

const AudioCall = ({ socket, receiverId }: AudioCallProps) => {
  const dispatch = useDispatch();
  const initiateCall = () => {
    socket.emit("outGoingCall", receiverId);
    dispatch(setOpenCallModal(true));
    dispatch(setCallState({ isOutGoingCall: true }))
  };
  return (
    <div>
      <div className="text-primary-violet hover:bg-primary-violet hover:text-primary-white px-2 py-1 rounded-md">
        <Phone className="cursor-pointer" onClick={initiateCall} size={20} />
      </div>
    </div>
  );
};

export default AudioCall;
