import { login } from "@/api/api";
import { loginSchema } from "@/schemas";
import { ErrorType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

interface UseLoginControllerType {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | undefined>>;
}
const useLoginController = ({
  setError,
  setSuccess,
}: UseLoginControllerType) => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState<string>("password");
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const loginBody = {
      email: values.email,
      password: values.password,
    };
    try {
      const loginResponse = await login(loginBody);
      Cookies.set(
        "TOKEN",
        JSON.stringify({
          ACCESSTOKEN: loginResponse?.data?.accessToken,
          REFRESH_TOKEN: loginResponse?.data?.refreshToken,
          EXPIRES_IN: loginResponse?.data?.expiresIn,
        })
      );
      setSuccess("Login Successful");
      setError(undefined);
      form.reset();
      navigate(`/${loginResponse.data.id}/home`);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        const err = error as ErrorType;
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setSuccess(undefined);
    }
  };

  const showPassword = () => {
    if (inputType === "password") {
      setInputType("text");
    } else {
      setInputType("password");
    }
  };
  return {
    form,
    onSubmit,
    showPassword,
    inputType,
  };
};

export default useLoginController;
