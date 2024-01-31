import { useSelector } from "react-redux";
import { Login, Signup, Tabs } from "../components";

const LoginSignup = () => {
  const login = useSelector((state: any) => state.authState.logIn);

  return (
    <>
      <Tabs />
      {login?<Login />:<Signup />}
    </>
  );
};

export default LoginSignup;
