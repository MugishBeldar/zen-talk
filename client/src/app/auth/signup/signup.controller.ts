import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { signUpSchema } from "@/schemas";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "@/api/api";
import { TOAST_OBJ } from "@/utils/enum";

interface UseSignUpControllerType {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const useSignUpController = ({
  setError,
  setSuccess,
}: UseSignUpControllerType) => {
  const [passwordinputType, setPasswordInputType] =
    useState<string>("password");
  const [confirmPasswordInputType, setConfirmPasswordInputType] =
    useState<string>("password");
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    // api call
    const signupBody = {
      name: values.name,
      email: values.email,
      password: values.password,
    };
    try {
      await signup(signupBody);
      toast.success(`Signup successful`, { ...TOAST_OBJ });
      setSuccess("Sign Up Successful");
      form.reset();
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
      setError("Failed to Sign Up");
    }
    return;
  };

  const showPassword = (input: string) => {
    if (input === "password") {
      setPasswordInputType((prevType) =>
        prevType === "password" ? "text" : "password"
      );
    } else if (input === "confirmPassword") {
      setConfirmPasswordInputType((prevType) =>
        prevType === "password" ? "text" : "password"
      );
    }
  };

  return {
    form,
    onSubmit,
    showPassword,
    passwordinputType,
    confirmPasswordInputType,
  };
};

export default useSignUpController;
