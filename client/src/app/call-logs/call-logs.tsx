import { cn } from '@/lib/utils';
import { stateType } from '@/types/store';
import { ChevronLeft, CornerLeftUp, MessageSquare, MoveDownLeft, MoveUpRight, } from 'lucide-react';
import { useSelector } from 'react-redux';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import useCallLogController from './call-logs.controller';
import { CallerOrReceiverTypes, CallLogsTypes, MessageType } from '@/types/user';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { bufferToBase64, capitalizeNames } from '@/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AudioCall from '../audio-call/audio-call';
import { Socket } from 'socket.io-client';
import { screenSizeStateType } from '@/store/screen-sizes/screen-sizes.action.types';

interface CallogsProps {
  socket: Socket
}

const renderUser = (user: CallerOrReceiverTypes, callLog: CallLogsTypes, callType: string, formatTime: (seconds: number) => string, formatDateWithLabels: (dateString: string) => string, screenSizes: screenSizeStateType) => {
  return (
    <div className='flex items-center gap-3 mx-3'>
      <Avatar>
        <AvatarImage
          src={
            user?.profilePic?.type === "Buffer"
              ? bufferToBase64(user?.profilePic)
              : `https://ui-avatars.com/api/?name=${user?.name}&background=7c3aed&color=eff6fc`
          }
          alt={`@${user?.name}`}
          className='w-10 h-10'
        />
      </Avatar>
      <div className='flex flex-col '>
        <p className="flex font-medium">{capitalizeNames(user?.name)}</p>
        <div className="flex justify-center items-center gap-3 w-full">
          {/* Incoming Call Icon */}
          {callType === "inComingCall" && callLog?.callDuration > 0 && (
            <MoveDownLeft size={12} className="text-green-600" />
          )}
          {/* Outgoing Call Icon */}
          {callType === "outGoingCall" && callLog?.callDuration > 0 && (
            <MoveUpRight
              size={12}
              className={cn(
                !callLog?.callDuration ? "text-destructive" : "text-green-600"
              )}
            />
          )}
          {/*Incoming Call And Miss It*/}
          {callType === "inComingCall" && !callLog.callDuration && (
            <CornerLeftUp size={12} className="text-red-600" />
          )}
          {/*Outgoing Call And Miss It*/}
          {callType === "outGoingCall" && !callLog.callDuration && (
            <MoveUpRight size={12} className="text-red-600" />
          )}
          {
            <p className='text-xs text-primary-gray'>{formatDateWithLabels(callLog.createdAt)}</p>
          }
          <div className={cn(screenSizes.smallScreen ? 'hidden' : 'text-xs text-primary-gray')}>
            Call Duration, {formatTime(callLog.callDuration)}
          </div>
        </div>
      </div>
    </div>
  )
}

const renderOption = (callInfo: CallerOrReceiverTypes, callMessageInfo: MessageType, socket: Socket, navigate: NavigateFunction) => {
  return (
    <div className='flex items-center justify-center gap-20'>
      <div className='cursor-pointer text-primary-violet hover:bg-primary-violet hover:text-primary-white px-2 py-1 rounded-md'>
        <MessageSquare size={20} onClick={() => navigate(`/${callInfo._id}/chat/${callMessageInfo.chat}`)} />
      </div>
      <AudioCall socket={socket} receiverId={callInfo._id} chatId={callMessageInfo.chat} />
    </div>
  )
}

const CallLogs = ({ socket }: CallogsProps) => {
  const { callLogs, formatTime, handleScroll, formatDateWithLabels } = useCallLogController();
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );
  const screenSizes = useSelector((state: stateType) => state.screenSizeState);

  return (
    <div className="py-4 w-full h-full">
      <div className="pb-4 flex items-center gap-2">
        <p
          onClick={() => navigate(-1)}
          className={
            screenSizes.smallScreen
              ? cn("text-primary-violet cursor-pointer")
              : cn("hidden")
          }
        >
          <ChevronLeft size={30} />
        </p>
        <p className={cn('text-xl font-medium', !screenSizes.smallScreen ? 'ml-3' : '')}>Call Logs</p>
      </div>

      {user?.id === userId && callLogs && callLogs.length > 0 &&
        <div className={cn(screenSizes.smallScreen ? 'h-[calc(100vh-160px)]' : 'h-[calc(100vh-100px)]', 'flex w-full gap-3')}>
          <div
            className={cn(
              screenSizes.smallScreen ? 'w-[100%]' : 'w-[100%]',
              'overflow-y-auto custom-scrollbar flex flex-col justify-start'
            )}
            onScroll={handleScroll}
          >
            <Accordion type="single" collapsible className="w-full">
              {callLogs.map((callLog: CallLogsTypes) => (
                <AccordionItem key={callLog._id} value={callLog._id}>
                  <AccordionTrigger className={cn('pr-3 hover:no-underline')}>
                    {renderUser(
                      callLog.receiver._id === userId ? callLog.caller : callLog.receiver,
                      callLog,
                      callLog.receiver._id === userId ? 'inComingCall' : 'outGoingCall',
                      formatTime,
                      formatDateWithLabels,
                      screenSizes
                    )}
                    
                  </AccordionTrigger>
                  <AccordionContent className='mx-3'>
                    {callLog.receiver._id === userId
                      ? renderOption(callLog.caller, callLog.callMessage, socket, navigate)
                      : renderOption(callLog.receiver, callLog.callMessage, socket, navigate)
                    }
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      }
    </div>
  );
};

export default CallLogs;