/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { setOpenCallModal } from '@/store/call-model/call-model.action'
import { bufferToBase64, capitalizeNames } from '@/utils'
import { Mic, MicOff, Phone } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Socket } from 'socket.io-client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { stateType } from '@/types/store'
import { setCallState } from '@/store/call-state/call-state-action'

interface CallProps {
  socket: Socket;
}
const Call = ({ socket }: CallProps) => {
  const dispatch = useDispatch();

  const [callDuration, setCallDuration] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const isOpenModal = useSelector((state: stateType) => state.callModalState.open);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const ringtoneRef = useRef<HTMLAudioElement>(new Audio("/assets/old-phone.mp3"));
  const callStates = useSelector((state: any) => state.callstate);
  const callReceiverUserData = useSelector((state: stateType) => state.callReceiverState.callReceiverUser);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      // clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0); // Reset timer
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Toggle Microphone On/Off
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

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
        socket.emit("ice-candidate", { candidate: event.candidate, to: callReceiverUserData._id });
      }
    };

    setPeerConnection(pc);
    return pc;
  }, [localStream, callReceiverUserData, socket]);


  const acceptCall = async () => {
    const pc = createPeerConnection();
    await getLocalStream(pc);
    socket.emit("outGoingCallAccepted", { to: callReceiverUserData._id });
    dispatch(setCallState({ isCallAccepted: true }));
    ringtoneRef.current.pause();
    startTimer();
  };

  const declineCall = () => {
    dispatch(setCallState({ isIncomingCall: false }));
    dispatch(setOpenCallModal(false))
    ringtoneRef.current.pause();
    endCall();
  };


  const endCall = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }
    dispatch(setOpenCallModal(false));
    dispatch(setCallState({ isOutGoingCall: false, isIncomingCall: false, isCallAccepted: false }));
    socket.emit("end-call", callReceiverUserData._id);
    stopTimer();
  }, [peerConnection, localStream, socket, callReceiverUserData]);


  useEffect(() => {
    // Ensure timer stops if the component unmounts
    return () => {
      stopTimer();
    };
  }, [stopTimer]);


  // get logged user local stream
  const getLocalStream = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing local audio:", error);
    }
  };


  // handling all socket events.
  useEffect(() => {
    socket.on("outGoingCall", () => {
      dispatch(setOpenCallModal(true));
      dispatch(setCallState({ isIncomingCall: true }));
      ringtoneRef.current.play();
    });

    socket.on("outGoingCallAccepted", async () => {
      const pc = createPeerConnection();
      dispatch(setCallState({ isCallAccepted: true }))
      await getLocalStream(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call-offer", { offer, to: callReceiverUserData._id });
      startTimer();
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
  }, [socket, peerConnection, localStream, createPeerConnection, callReceiverUserData, endCall]);

  const hangUpCall = async () => {
    console.log('hangUp call states:--', callStates, callDuration);
    dispatch(setCallState({ isOutGoingCall: false, isIncomingCall: false, isCallAccepted: false }));
    endCall();
  }

  return (
    (callStates.isOutGoingCall || callStates.isIncomingCall) && callReceiverUserData && callReceiverUserData._id &&
    <>
      <audio ref={remoteAudioRef} className="hidden" />
      <Dialog open={isOpenModal} onOpenChange={setOpenCallModal}>
        <DialogContent
          className="[&>button]:hidden rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:w-[300px]"
          onInteractOutside={(event) => event.preventDefault()} // Prevent closing on outside click
        >
          <DialogTitle className="font-medium ">
            {callStates && callStates.isIncomingCall && (
              <div className="light">
                {/* <div className="wrapper"> */}
                <div className="shine-text pb-1">
                  Incoming call . . .
                </div>
                {/* </div> */}
              </div>
            )}
            {callStates && callStates.isOutGoingCall && (
              <div className="light">
                {/* <div className="wrapper"> */}
                <div className="shine-text pb-1">
                  Outgoing call . . .
                </div>
              </div>
              // </div>
            )}
            <div className='border-b mt-3'></div>
          </DialogTitle>
          <div className='flex flex-col gap-4 justify-center items-center'>
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={
                  callReceiverUserData?.profilePic
                    ? bufferToBase64(callReceiverUserData.profilePic)
                    : `https://ui-avatars.com/api/?name=${callReceiverUserData?.name}&background=7c3aed&color=eff6fc`
                }
                alt="user"
                className="rounded-full"
              />
              <AvatarFallback>{callReceiverUserData?.name ? capitalizeNames(callReceiverUserData?.name) : 'user'}</AvatarFallback>
            </Avatar>
            <p>{callReceiverUserData && capitalizeNames(callReceiverUserData?.name)}</p>
          </div>
          <div className='flex justify-center items-center'>
            {callStates.isCallAccepted && (
              <p className="text-sm font-medium text-gray-600">{formatTime(callDuration)}</p>
            )}
          </div>
          {
            callStates && callStates.isOutGoingCall && !callStates.isIncomingCall &&
            <div className='flex justify-center items-center gap-4'>
              {
                callStates.isCallAccepted &&
                <div>
                  <Button
                    onClick={toggleMic}
                    className="px-4 py-2 text-sm sm:text-base bg-gray-500 hover:bg-gray-400 text-white hover:text-white"
                  >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </Button>
                </div>
              }
              <div>
                <Button
                  className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-500/80 text-white hover:text-white"
                  onClick={hangUpCall} variant="outline">
                  <Phone className="cursor-pointer" style={{ transform: 'rotate(135deg)' }} size={20} />
                  Hang Up
                </Button>
              </div>
            </div>
          }
          {
            callStates && callStates.isIncomingCall && !callStates.isOutgoingCall && !callStates.isCallAccepted &&
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={declineCall}
                className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-500/80 text-white hover:text-white"
              >
                <Phone className="cursor-pointer" style={{ transform: 'rotate(135deg)' }} size={20} />
                Decline
              </Button>
              <Button
                onClick={acceptCall}
                className={cn("px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-600/80 text-white hover:text-white ")}
              >
                Accept
              </Button>
            </div>
          }
          {
            callStates && callStates.isCallAccepted && callStates.isIncomingCall && !callStates.isOutgoingCall &&
            <div className="flex justify-center items-center gap-4">
              <div>
                <Button
                  onClick={toggleMic}
                  className="px-4 py-2 text-sm sm:text-base bg-gray-500 hover:bg-gray-400 text-white hover:text-white"
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  {/* {isMicOn ? "Mic On" : "Mic Off"} */}
                </Button>
              </div>
              <div>
                <Button
                  className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-500/80 text-white hover:text-white"
                  onClick={declineCall} variant="outline">
                  <Phone className="cursor-pointer" style={{ transform: 'rotate(135deg)' }} size={20} />
                  Hang Up
                </Button>
              </div>
            </div>
          }
        </DialogContent >
      </Dialog >
    </>
  )
}

export default Call