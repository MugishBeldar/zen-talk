import { Outlet } from "react-router-dom";
import Header from "./header/header";
import Footer from "./footer/footer";

function AuthRoot() {
  return (
    <div className="flex flex-col h-screen bg-primary-white">
      <Header />
      <main className="flex-grow container mx-auto p-4 ">
        <Outlet /> {/* Renders the child route components here */}
      </main>
      <Footer />
    </div>
  );
}

export default AuthRoot;
