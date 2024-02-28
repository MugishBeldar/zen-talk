// import requiredd dependencys
import { createStore,  combineReducers } from 'redux';
import authReducer from './auth/auth.reducer'
import loadingIndicatorReducer from './loadingIndicator/loadingIndicator.reducer';
import isEditReducer from './edit/edit.reducer';
import isSetChatReducer from './chats/chat.reducer';
import drawerReducer from './drawer/drawer.reducer';

let localStoreVar:any = null;

// make function get all static reducer
export const getStaticReducer = () => ({
    authState: authReducer,
    loadingIndicatorstate: loadingIndicatorReducer,
    editState: isEditReducer,
    chatState :isSetChatReducer, 
    drawerState: drawerReducer,
});

// combine all static reducers
export const configureStore = () => {
    localStoreVar = createStore(
        combineReducers(getStaticReducer()),
    );
    return localStoreVar;
};

export const getStore = () => {
    if (localStoreVar === null) {
        return configureStore();
    }
    return localStoreVar;
};
