// import requiredd dependencys
import { createStore, applyMiddleware, combineReducers } from 'redux';
import authReducer from './auth/auth.reducer'
import loadingIndicatorReducer from './loadingIndicator/loadingIndicator.reducer';
let localStoreVar:any = null;

// make function get all static reducer
export const getStaticReducer = () => ({
    authState: authReducer,
    loadingIndicatorstate: loadingIndicatorReducer,
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
