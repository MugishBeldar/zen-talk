import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <>
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
        <nav className="container mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Zen Talk</h1>
          <div>
            <Link to="/login" className="mr-4 hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
