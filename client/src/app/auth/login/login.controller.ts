import { loginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface UseLoginControllerType {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | undefined>>;
}
const useLoginController = ({
  setError,
  setSuccess,
}: UseLoginControllerType) => {

  const [inputType, setInputType] = useState<string>('password');
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
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
      setSuccess("Login Successful");
    }
    form.reset();
    return;
  };

  const showPassword = () => {
    if(inputType === "password") {
      setInputType('text');
    } else {
      setInputType('password');
    }
  }
  return {
    form,
    onSubmit,
    showPassword,
    inputType,
  };
};

export default useLoginController;
