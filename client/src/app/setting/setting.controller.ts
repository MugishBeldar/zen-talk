/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateProfile } from "@/api/api";
import { updateProfileSchema } from "@/schemas";
import { stateType } from "@/types/store";
import { bufferToBase64 } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { loggedUser } from "@/store/logged-user/logged-user.action";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const useSettingController = () => {
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState(
    bufferToBase64(user?.profilePic) || undefined
  );
  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const handleCancel = () => {
    const lastChat = Cookies.get("LAST_CHAT");
    if (lastChat) {
      const { reciverUserId, chatId } = JSON.parse(lastChat);
      navigate(`/${reciverUserId}/chat/${chatId}`);
    } else {
      navigate("/");
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfilePic(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof updateProfileSchema>) => {
    const name = values.name as any;
    const formData = new FormData();
    if (newProfilePic) {
      formData.append("profilePic", newProfilePic);
    }
    if (name) {
      formData.append("name", name);
    }
    try {
      if (user?.id) {
        const updatedUserInfo = await updateProfile(formData, user?.id);
        dispatch(
          loggedUser({
            id: updatedUserInfo.data._id,
            name: updatedUserInfo.data.name,
            email: updatedUserInfo.data.email,
            profilePic: updatedUserInfo.data.profilePic,
          })
        );
      }
    } catch (error) {
      console.log(": onSubmit -> error", error);
    }
  };

  return {
    form,
    onSubmit,
    profilePic,
    handleProfilePicChange,
    handleCancel,
  };
};

export default useSettingController;
