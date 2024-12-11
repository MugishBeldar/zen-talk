import { getUserById } from "@/api/api";
import { userType } from "@/types/user";
import { useEffect, useState } from "react";

interface useCallModelProps {
  receiverId: string;
}
const useCallModelController = ({ receiverId }: useCallModelProps) => {
  const [reciverUser, setReciverUser] = useState<userType>();

  useEffect(() => {
    (async function () {
      const response = await getUserById(receiverId);
      if (response.data && response.data) {
        setReciverUser(response.data[0]);
      }
    })();
  }, [receiverId]);
  return {
    reciverUser,
  };
};

export default useCallModelController;
