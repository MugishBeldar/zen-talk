import { FormEvent } from "react";

interface loginControllerProps {
  formValue: {
    email: string;
    password: string;
  }; 
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setFormValue: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
  }>>
}

const LoginController = ({ formValue, setShowPassword, setFormValue }: loginControllerProps) => {

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Function to handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formValue);
    setFormValue({
      email: "",
      password: "",
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
    handleChange,
  };
};

export default LoginController;