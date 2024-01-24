import React from "react";
import "./App.css";
// import LoginSignup from "./pages/login-signup"
import { Provider } from "react-redux";
import { getStore } from "./store/store";
import MainRouting from "./routing/index";
function App() {
  const store = getStore();
  return (
    <Provider store={store}>
      <MainRouting />
    </Provider>
  );
}

export default App;
