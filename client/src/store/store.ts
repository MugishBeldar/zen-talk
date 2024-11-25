/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, combineReducers } from "redux";
import LZString from "lz-string";
import loggedUserReducer from "./logged-user/logged-user.reducer";
import isSetChatListReducer from "./chat-list/chat-list.reducer";
import { openSettingReducer } from "./setting-model/setting-model.reducer";
import { initiateSpinnerReducer } from "@/store/spinner/spinner.reducer.ts";
import { initiateScreenSizeReducer } from "./screen-sizes/screen-size.reducer";

let localStoreVar: any = null;

// Helper function to load compressed state from localStorage
const loadState = () => {
  try {
    const compressedState = localStorage.getItem("reduxState");
    if (!compressedState) return undefined;

    // Decompress state from LZ-string format
    const decompressedState = LZString.decompress(compressedState);
    return decompressedState ? JSON.parse(decompressedState) : undefined;
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};

// Helper function to save compressed state to localStorage
const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);

    // Compress state with LZ-string before saving
    const compressedState = LZString.compress(serializedState);
    localStorage.setItem("reduxState", compressedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};

// Get all static reducers
export const getStaticReducer = () => ({
  loggedUserState: loggedUserReducer,
  chatListState: isSetChatListReducer,
  settingState: openSettingReducer,
  spinnerState: initiateSpinnerReducer,
  screenSizeState: initiateScreenSizeReducer,
});

// Combine reducers and configure the store
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
