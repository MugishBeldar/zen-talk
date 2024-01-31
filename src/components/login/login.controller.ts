import { FormEvent } from "react";
import { clicked } from "../../store/loadingIndicator/loadingIndicator.action";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { login } from "../../api/api";
import { toast } from "react-toastify";
import { TOAST_OBJ } from "../../utils/enum";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
interface loginControllerProps {
  formValue: {
    email: string;
    password: string;
  };
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setFormValue: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
    }>
  >;
}

const LoginController = ({
  formValue,
  setShowPassword,
  setFormValue,
}: loginControllerProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      dispatch(clicked(true));
      setFormValue({
        email: "",
        password: "",
      });
      const response = await login(formValue);
      Cookies.set(
        "TOKEN",
        JSON.stringify({
          ACCESSTOKEN: response?.data?.data?.accessToken,
          REFRESH_TOKEN: response?.data?.data?.refreshToken,
          EXPIRES_IN: response?.data?.data?.expiresIn,
        })
      );
      Cookies.set(
        "USER_INFO",
        JSON.stringify({
          ID: response?.data?.data?.id,
          EMAIL: response?.data?.data?.email,
          NAME: response?.data?.data?.name,
          PROFILEPIC: response?.data?.data?.profilePic,
        })
      );
      toast.success("Login Successfull..", { ...TOAST_OBJ });
      dispatch(clicked(false));
      navigate("chat");
    } catch (error) {
      dispatch(clicked(false));
      const err = error as AxiosError;
      if (err.isAxiosError && err.response) {
        const { status } = err.response;

        if (status === 401) {
          toast.error(
            "Invalid credentials. Please double-check your email and password.",
            { ...TOAST_OBJ }
          );
        } else if (status === 404) {
          toast.error(
            "Oops! It seems like your email is not registered. Please sign up.",
            {
              ...TOAST_OBJ,
            }
          );
        } else {
          toast.error(
            `Oops! An unexpected error occurred with status code ${status}. Please try again later.`,
            {
              ...TOAST_OBJ,
            }
          );
        }
      } else {
        toast.error("Sorry, something went wrong. Please try again later.", {
          ...TOAST_OBJ,
        });
      }
    }
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
