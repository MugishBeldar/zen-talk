import React, { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { signup } from "../../api/api";
import { TOAST_OBJ } from "../../utils/enum";
import { clicked } from "../../store/loadingIndicator/loadingIndicator.action";

import storage from "../../firebaseConfig";
interface signUpControllerPropes {
  formValue: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    profilePicture: string;
  };
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setFormValue: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      profilePicture: string;
    }>
  >;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RgisterController = ({
  setShowPassword,
  formValue,
  setFormValue,
  setLoading,
}: signUpControllerPropes) => {
  const [profilePicLink, setProfilePicLink] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleChange = (e: any, fieldName: string, value: string) => {
    setFormValue((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    if (fieldName === "profilePicture") {
      setLoading(true);
      const files = e.target.files;
      const file = files[0];
      if (files.length) {
        const storageRef = ref(storage, `files/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (err) => console.log(err),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url: string) => {
              setProfilePicLink(url);
              setLoading(false);
            });
          }
        );
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      dispatch(clicked(true));
      const userData = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        profilePicture: profilePicLink,
      };
      await signup(userData);
      setFormValue({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilePicture: "",
      });
      dispatch(clicked(false));
      navigate("/");
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(`Email alredy register ples login`, { ...TOAST_OBJ });
      dispatch(clicked(false));
    }
  };

  return {
    handleTogglePasswordVisibility,
    handleSubmit,
    handleChange,
  };
};

export default RgisterController;
