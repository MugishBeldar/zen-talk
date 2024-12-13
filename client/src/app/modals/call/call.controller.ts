import { stateType } from "@/types/store";
import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Socket } from "socket.io-client";

interface UseCallController {
  socket: Socket;
}
const useCallController = ({ socket }: UseCallController) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const ringtoneRef = useRef<HTMLAudioElement>(new Audio("/assets/old-phone.mp3"));
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const isOpenModal = useSelector((state: stateType) => state.callModalState.open);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream !== localStream && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: receiverId,
        });
      }
    };

    setPeerConnection(pc);
    return pc;
  }, [localStream, receiverId, socket]);
  return {
    isOpenModal,
  };
};

export default useCallController;
