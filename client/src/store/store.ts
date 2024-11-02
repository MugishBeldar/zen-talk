/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, combineReducers } from "redux";
import loggedUserReducer from "./logged-user/logged-user.reducer";

let localStoreVar: any = null;

// Helper function to load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};

// Helper function to save state to localStorage
const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};

// make function get all static reducer
export const getStaticReducer = () => ({
  loggedUserState: loggedUserReducer,
});

// combine all static reducers
export const configureStore = () => {
  // Load initial state from localStorage
  const preloadedState = loadState();

  // Create the store with combined reducers and preloaded state
  localStoreVar = createStore(
    combineReducers(getStaticReducer()),
    preloadedState
  );

  // Subscribe to store updates to save the state in localStorage
  localStoreVar.subscribe(() => {
    saveState(localStoreVar.getState());
  });

  return localStoreVar;
};

export const getStore = () => {
  if (localStoreVar === null) {
    return configureStore();
  }
  return localStoreVar;
};
