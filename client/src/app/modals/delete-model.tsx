import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteModalProps {
  isOpenModal: boolean;
  setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFunction: (chatId: string) => Promise<void>;
  id: string | undefined;
}

const DeleteModal = ({
  deleteFunction,
  isOpenModal,
  setIsOpenModal,
  id,
}: DeleteModalProps) => {
  return (
    <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
      <DialogContent className="rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold sm:text-xl md:text-2xl">
            Delete this chat?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 sm:text-base md:text-lg">
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpenModal(false)}
            className="px-4 py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            // variant="destructive"
            onClick={async () => {
              setIsOpenModal(false);
              if (id) await deleteFunction(id);
            }}
            className="px-4 py-2 text-sm sm:text-base bg-primary-indigo hover:bg-secondary-indigo"
          >
            Delete Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
