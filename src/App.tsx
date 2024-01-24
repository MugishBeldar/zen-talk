import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { getStore } from "./store/store";
import MainRouting from "./routing/index";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const store = getStore();
  return (
    <Provider store={store}>
      <MainRouting />
      <ToastContainer />
    </Provider>
  );
}

export default App;
