import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/schemas";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    // api call
    console.log("sign up form value:---", values);
    // const { error, success } = await createProduct(
    //   values,
    //   uploadedImageUrl,
    //   category?.id,
    //   tags,
    //   keyFeatures,
    //   productThumbnail
    // );
    // eslint-disable-next-line no-constant-condition
    if (false) {
      setError("Somethig went wrong");
    }
    // eslint-disable-next-line no-constant-condition
    if (true) {
      setSuccess("Sign Up Successful");
      navigate("/login", { replace: true });
    }
    form.reset();
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
