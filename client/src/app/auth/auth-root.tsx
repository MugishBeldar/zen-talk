import { Outlet, useNavigate } from "react-router-dom";
import Header from "./header/header";
import Footer from "./footer/footer";
import { useAuth } from "@/hooks";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { LoggedUserType } from "@/types/user";

export interface stateType {
  loggedUserState: LoggedUserState;
}
export interface LoggedUserState {
  loggedUser?: null | LoggedUserType;
}

function AuthRoot() {
  const isLoggedIn = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state: stateType) => {
    return state.loggedUserState.loggedUser;
  });
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      if (user && isLoggedIn) {
        navigate(`/${user.id}/chat`);
      } else {
        navigate("/login");
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-primary-white">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AuthRoot;
