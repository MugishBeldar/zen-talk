/* eslint-disable default-case */
import { cloneDeep } from 'lodash'
import AUTH_ACTION from './auth.action.types';

const initialState = {
    logIn: true,
}

function authReducer(state = cloneDeep(initialState), action) {
    switch (action.type) {
        case AUTH_ACTION.LOGIN: {
            state.logIn = true;
            return {
                ...state
            }
        }
        case AUTH_ACTION.SIGNUP: {
            state.logIn = false;
            return {
                ...state
            }
        }
        default:
            return state;
    }
}

export default authReducer;