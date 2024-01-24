import React, { FormEvent, useState } from "react";
import storage from "../../firebaseConfig.js";
import { clicked } from "../../store/loadingIndicator/loadingIndicator.action";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signup } from "../../api/api";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";

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
  // setButtonLoadingIndicator: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUpController = ({
  setShowPassword,
  formValue,
  setFormValue,
  // setButtonLoadingIndicator,
  setLoading,
}: signUpControllerPropes) => {

  const [profilePicLink, setProfilePicLink] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
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
      dispatch(clicked(true))
      const userData = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        profilePicture: profilePicLink,
      }
      await signup(userData);
      setFormValue({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilePicture: "",
      });
      dispatch(clicked(false))
      navigate('home');
    } catch (error) {
      console.error("Error during signup:", error);
      dispatch(clicked(false))
    }
  };

  return {
    handleTogglePasswordVisibility,
    handleSubmit,
    handleChange,
  };
};

export default SignUpController;
