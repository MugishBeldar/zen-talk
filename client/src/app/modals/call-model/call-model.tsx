import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import useCallModelController from './call-model.controller';
// import { useSelector } from 'react-redux';
// import { stateType } from '@/types/store';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { bufferToBase64, capitalizeNames } from '@/utils';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallModelProps {
  isOpenModel: boolean;
  setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOutGoingCall: boolean;
  isIncomingCall: boolean;
  isCallAccepted: boolean;
  receiverId: string;
}

const CallModel = ({
  receiverId,
  isOpenModel,
  // isCallAccepted,
  // isIncomingCall,
  isOutGoingCall,
  setIsOpenModal,
}: CallModelProps) => {
  const { reciverUser } = useCallModelController({ receiverId });
  console.log('\n\n[+]: CallModel -> reciverUser', reciverUser);


  // const user = useSelector((state: stateType) => {
  //   return state.loggedUserState.loggedUser;
  // })

  return (
    
    <Dialog open={isOpenModel} onOpenChange={setIsOpenModal}>
      <DialogContent
        className="[&>button]:hidden rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:w-[300px]"
        onInteractOutside={(event) => event.preventDefault()} // Prevent closing on outside click
      >
        <DialogTitle className="font-medium ">
          {!isOutGoingCall ? (
            <div className="light">
              {/* <div className="wrapper"> */}
              <div className="shine-text pb-1">
                Incoming call . . .
              </div>
              {/* </div> */}
            </div>
          ) : (
            <div className="light">
              <div className="wrapper">
                <div className="shine-text pb-1">
                  Outgoing call . . .
                </div>
              </div>
            </div>
          )}
          <div className='border-b mt-3'></div>
        </DialogTitle>
        <div className='flex flex-col gap-4 justify-center items-center'>
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={
                reciverUser?.profilePic
                  ? bufferToBase64(reciverUser.profilePic)
                  : `https://ui-avatars.com/api/?name=${reciverUser?.name}&background=7c3aed&color=eff6fc`
              }
              alt="Profile"
              className="rounded-full"
            />
            <AvatarFallback>{reciverUser?.name ? capitalizeNames(reciverUser?.name) : ''}</AvatarFallback>
          </Avatar>
          <p>{reciverUser && capitalizeNames(reciverUser?.name)}</p>
        </div>
        {/* Header removed to ensure no "X" close button */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpenModal(false)}
            className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-500/80 text-white hover:text-white"
          >
            <Phone className="cursor-pointer" style={{ transform: 'rotate(135deg)' }} size={20} />

            Decline
          </Button>
          <Button
            className={cn(isOutGoingCall ? 'hidden' : "px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-600/80 text-white hover:text-white ")}
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModel;
