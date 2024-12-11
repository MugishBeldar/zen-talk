import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { CallModel } from "../modals";

interface AudioCallProps {
  socket: Socket;
  receiverId: string; // ID of the user to call
}

const AudioCall = ({ socket, receiverId }: AudioCallProps) => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isOutGoingCall, setIsOutGoingCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const ringtoneRef = useRef<HTMLAudioElement>(new Audio("/assets/old-phone.mp3"));

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
        socket.emit("ice-candidate", { candidate: event.candidate, to: receiverId });
      }
    };

    setPeerConnection(pc);
    return pc;
  }, [localStream, receiverId, socket]);

  const getLocalStream = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing local audio:", error);
    }
  };

  const initiateCall = () => {
    socket.emit("outGoingCall", receiverId);
    setIsOutGoingCall(true);
    setIsOpenModal(true);
  };

  const acceptCall = async () => {
    const pc = createPeerConnection();
    await getLocalStream(pc);
    socket.emit("outGoingCallAccepted", { to: receiverId });
    setIsCallAccepted(true);
    ringtoneRef.current.pause();
  };

  const declineCall = () => {
    setIsIncomingCall(false);
    // Stop the ringtone if the call is declined
    ringtoneRef.current.pause();
    endCall()
  };

  // Wrap the endCall function using useCallback
  const endCall = useCallback(() => {
    // Proper cleanup for the receiver side too
    if (peerConnection) {
      // Close peer connection
      peerConnection.close();
      setPeerConnection(null);

      // Stop all local media tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }

    setIsOutGoingCall(false);
    setIsIncomingCall(false);
    setIsCallAccepted(false);

    // Notify the other party to end the call
    socket.emit("end-call", receiverId);

  }, [peerConnection, localStream, socket, receiverId]);

  useEffect(() => {
    socket.on("outGoingCall", () => {
      setIsIncomingCall(true);
      setIsOpenModal(true)
      ringtoneRef.current.play();
    });

    socket.on("outGoingCallAccepted", async () => {
      const pc = createPeerConnection();
      setIsCallAccepted(true);
      await getLocalStream(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call-offer", { offer, to: receiverId });
    });

    socket.on("call-offer", async ({ offer, from }) => {
      const pc = createPeerConnection();
      setPeerConnection(pc);
      await getLocalStream(pc);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call-answer", { answer, to: from });
    });

    socket.on("call-answer", async ({ answer }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!peerConnection) return;

      const iceCandidate = new RTCIceCandidate(candidate);
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(iceCandidate);
      } else {
        iceCandidateQueue.current.push(iceCandidate);
      }
    });

    socket.on("end-call", () => {
      endCall();
      window.location.reload();
    });

    return () => {
      socket.off("outGoingCall");
      socket.off("outGoingCallAccepted");
      socket.off("call-offer");
      socket.off("call-answer");
      socket.off("ice-candidate");
      socket.off("end-call");
    };
  }, [socket, peerConnection, localStream, createPeerConnection, receiverId, endCall]);

  return (
    <div>
      <audio ref={remoteAudioRef} className="hidden" />
      <CallModel receiverId={receiverId} isOpenModel={isOpenModal} setIsOpenModal={setIsOpenModal} isOutGoingCall={isOutGoingCall} isIncomingCall={isIncomingCall} isCallAccepted={isCallAccepted} />
      {!isOutGoingCall && !isIncomingCall && (
        <div className="text-primary-violet hover:bg-primary-violet hover:text-primary-white px-2 py-1 rounded-md">
          <Phone className="cursor-pointer" onClick={initiateCall} size={20} />
        </div>
      )}

      {isIncomingCall && !isCallAccepted && (
        <div>
          <p>Incoming Call...</p>
          <Button onClick={acceptCall}>Accept</Button>
          <Button onClick={declineCall}>Decline</Button>
        </div>
      )}

      {(isOutGoingCall || isCallAccepted) && (
        <Button onClick={endCall}>End Call</Button>
      )}
    </div>
  );
};

export default AudioCall;
