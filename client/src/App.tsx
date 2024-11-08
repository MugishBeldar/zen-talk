import "./App.css";
import { MainRouting } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStore } from "./store/store";
import { Provider } from "react-redux";

function App() {
  const store = getStore();
  return (
    <>
      <Provider store={store}>
        <ToastContainer />
        <MainRouting />
      </Provider>
    </>
  );
}

export default App;
