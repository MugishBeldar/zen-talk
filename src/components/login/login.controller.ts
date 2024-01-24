import { FormEvent } from "react";
import { clicked } from "../../store/loadingIndicator/loadingIndicator.action";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { login } from "../../api/api";
import { toast } from "react-toastify";
import { TOAST_OBJ } from "../../utils/enum";
import Cookies from "js-cookie";
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
          EMAIL: response?.data?.data?.email,
          NAME: response?.data?.data?.name,
        })
      );
      toast.success("Login Successfull..", { ...TOAST_OBJ });
      dispatch(clicked(false));
      navigate("home");
    } catch (error) {
      console.log(error);
      dispatch(clicked(false));
      //@ts-ignore
      if (error.response && error.response.status === 401) {
        toast.error(
          "Invalid credentials. Please check your email and password.",
          { ...TOAST_OBJ }
        );
      } else {
        toast.error("An error occurred. Please try again later.", {
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
