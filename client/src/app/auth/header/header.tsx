import { Link, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <>
      <header className="bg-gradient-to-r from-primary-indigo to-primary-violet p-4 text-primary-white">
        <nav className="container mx-auto flex justify-between">
          <h1
            onClick={() => navigate("/login")}
            className="text-2xl font-bold cursor-pointer"
          >
            Zen Talk
          </h1>
          <div>
            <Link to="/login" className="text-lg mr-4 hover:underline">
              Login
            </Link>
            <Link to="/signup" className="text-lg hover:underline">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
