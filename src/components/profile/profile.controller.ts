import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot, } from "firebase/storage";

import { updateUser } from "../../api/api";
import storage from "../../firebaseConfig";
import { userType, userTypes } from "../../types";
import { edit } from "../../store/edit/edit.action";
import { clicked } from "../../store/loadingIndicator/loadingIndicator.action";

interface FormDataEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement & {
    name: { value: string };
    profilePicture: FileList | null;
  };
}
interface ProfileControllerProps {
  userInfo: userType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useProfileController = ({
  userInfo,
  setOpen,
}: ProfileControllerProps) => {
  const dispatch = useDispatch();
  const editState = useSelector((state: any) => state.editState.edit);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(edit(!editState));
  };

  const handleSubmit = async (e: FormDataEvent) => {
    e.preventDefault();
    dispatch(clicked(true));
    const formData = new FormData(e.target);
    const name = formData.get("name") as string | null;
    const files: any = formData.get("profilePicture");

    if (name && files.name.length > 0) {
      const file = files;
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (err) => console.log(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          if (url) {
            const updateUserData = {
              name: name,
              profilePic: url,
              email: userInfo.EMAIL,
            };
            const response = await updateUser(updateUserData);
            if (response?.data?.data) {
              updateCookies(response.data.data);
            }
            setOpen(false);
          }
          dispatch(clicked(false));
          return;
        }
      );
    } else if (name) {
      const updateUserData = {
        name: name,
        email: userInfo.EMAIL,
      };
      const response = await updateUser(updateUserData);
      if (response?.data?.data) {
        updateCookies(response.data.data);
      }
      setOpen(false);
      dispatch(clicked(false));
      return;
    } else {
      setOpen(false);
      dispatch(clicked(false));
      return;
    }
  };

  const updateCookies = (updatedUserInfo: userTypes) => {
    Cookies.set(
      "USER_INFO",
      JSON.stringify({
        ID: updatedUserInfo._id,
        EMAIL: updatedUserInfo.email,
        NAME: updatedUserInfo.name,
        PROFILEPIC: updatedUserInfo.profilePic,
      })
    );
  };

  return {
    handleSubmit,
    updateCookies,
    handleOpen,
    handleClose,
  };
};

export default useProfileController;
