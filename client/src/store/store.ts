/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, combineReducers } from "redux";
import loggedUserReducer from "./logged-user/logged-user.reducer";
import isSetChatListReducer from "./chat-list/chat-list.reducer";

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

const saveState = (state: any) => {
  try {
    // Create a copy of the state without chatListState
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { chatListState, ...stateToPersist } = state;
    const serializedState = JSON.stringify(stateToPersist);
    localStorage.setItem("reduxState", serializedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};
// make function get all static reducer
export const getStaticReducer = () => ({
  loggedUserState: loggedUserReducer,
  chatListState: isSetChatListReducer, // here i dont have to persist this
});

// combine all static reducers
export const configureLocalStore = () => {
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
    return configureLocalStore();
  }
  return localStoreVar;
};
