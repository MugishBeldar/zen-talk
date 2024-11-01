import "./App.css";
import { MainRouting } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <ToastContainer />
      <MainRouting />
    </>
  );
}

export default App;
