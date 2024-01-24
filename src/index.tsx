import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import { Provider } from "react-redux";
// import { getStore } from "./store/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
// const store = getStore();

root.render(
  //<Provider store={store}>
  <StrictMode>
    <App />
  </StrictMode>
  // </Provider>
);
