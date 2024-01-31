/* eslint-disable default-case */
import { cloneDeep } from 'lodash'
import SET_CHATS from './chat.action.types';

const initialState = {
    chats: [],
}

function isSetChatReducer(state = cloneDeep(initialState), action: { type: any, payload: any }) {
    switch (action.type) {
        case SET_CHATS.SET: {
            state.chats = action.payload;
            return {
                ...state
            }
        }
        default:
            return state;
    }
}

export default isSetChatReducer;