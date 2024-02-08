/* eslint-disable jsx-a11y/anchor-is-valid */
import { useDispatch } from "react-redux";
import { logIn, signUp } from "../../store/auth/auth.action";
import { useLocation, useNavigate } from "react-router";

const Tabs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleTabClick = (tab: string) => {
    if (tab === "login") {
      dispatch(logIn());
      navigate('/');
    } else {
      dispatch(signUp());
      navigate('signup');
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <a
          onClick={() => handleTabClick("login")}
          className={`py-3 px-4 rounded mr-10 cursor-pointer shadow-lg text-base  ${pathname === '/' ? 'bg-[#075e54] text-[#fff]' : null} hover:bg-hoverButtonColor hover:text-white`}
        >
          LOGIN
        </a>
        <a
          onClick={() => handleTabClick("signup")}
          className={`py-3 px-4 rounded cursor-pointer shadow-lg text-base ${pathname === '/signup' ? 'bg-[#075e54] text-[#fff]' : null} hover:bg-hoverButtonColor hover:text-white`}
        >
          REGISTER
        </a>
      </div>
    </>
  );
};

export default Tabs;
