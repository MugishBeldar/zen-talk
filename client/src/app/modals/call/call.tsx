import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { setOpenCallModal } from '@/store/call-model/call-model.action'
import { capitalizeNames } from '@/utils'
// import { bufferToBase64, capitalizeNames } from '@/utils'
import { Phone } from 'lucide-react'
// import React from 'react'
import { useDispatch } from 'react-redux'
import useCallController from './call.controller'
import { Socket } from 'socket.io-client'

interface CallProps {
  socket: Socket;
}
const Call = ({ socket }: CallProps) => {
  const dispatch = useDispatch();
  const test = false;

  const { isOpenModal } = useCallController({ socket });

  return (
    <Dialog open={isOpenModal} onOpenChange={setOpenCallModal}>
      <DialogContent
        className="[&>button]:hidden rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:w-[300px]"
        onInteractOutside={(event) => event.preventDefault()} // Prevent closing on outside click
      >
        <DialogTitle className="font-medium ">
          {!test ? (
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
              // src={
              //   reciverUser?.profilePic
              //     ? bufferToBase64(reciverUser.profilePic)
              //     : `https://ui-avatars.com/api/?name=${reciverUser?.name}&background=7c3aed&color=eff6fc`
              // }
              src={'https://ui-avatars.com/api/?name=new call modal test&background=7c3aed&color=eff6fc'}
              alt="Profile"
              className="rounded-full"
            />
            {/* <AvatarFallback>{reciverUser?.name ? capitalizeNames(reciverUser?.name) : ''}</AvatarFallback> */}
          </Avatar>
          {/* <p>{reciverUser && capitalizeNames(reciverUser?.name)}</p> */}
          <p>{capitalizeNames('New call modal test')}</p>
        </div>
        {/* Header removed to ensure no "X" close button */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => dispatch(setOpenCallModal(false))}
            className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-500/80 text-white hover:text-white"
          >
            <Phone className="cursor-pointer" style={{ transform: 'rotate(135deg)' }} size={20} />

            Decline
          </Button>
          <Button
            className={cn(test ? 'hidden' : "px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-600/80 text-white hover:text-white ")}
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Call