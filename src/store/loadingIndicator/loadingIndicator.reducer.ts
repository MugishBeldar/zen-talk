/* eslint-disable default-case */
import { cloneDeep } from 'lodash'
import  LOADING_INDICATOR from './loadingIndicator.action.types';

const initialState = {
    clicked: false,
}

function loadingIndicatorReducer(state = cloneDeep(initialState), action: { type: any, payload: boolean }) {
    switch (action.type) {
        case LOADING_INDICATOR.CLICKED: {
            // state.clicked = !initialState.clicked;
            state.clicked = action.payload;
            return {
                ...state
            }
        }
        default:
            return state;
    }
}

export default loadingIndicatorReducer;