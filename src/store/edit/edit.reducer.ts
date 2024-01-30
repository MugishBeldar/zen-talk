/* eslint-disable default-case */
import { cloneDeep } from 'lodash'
import IS_EDIT from './edit.action.types';

const initialState = {
    edit: false,
}

function isEditReducer(state = cloneDeep(initialState), action: { type: any, payload: boolean }) {
    switch (action.type) {
        case IS_EDIT.EDIT: {
            state.edit = action.payload;
            return {
                ...state
            }
        }
        default:
            return state;
    }
}

export default isEditReducer;