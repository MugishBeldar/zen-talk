import React, { FormEvent } from "react";

interface signUpControllerPropes {
  formValue: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setFormValue: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }>
  >;
}

const SignUpController = ({
  setShowPassword,
  formValue,
  setFormValue,
}: signUpControllerPropes) => {

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formValue);
    setFormValue({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (fieldName: string, value: string) => {
    setFormValue((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  return {
    handleTogglePasswordVisibility,
    handleSubmit,
    handleChange
  };
};

export default SignUpController;
