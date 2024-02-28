/* eslint-disable default-case */
import { cloneDeep } from 'lodash'
import DRAWER_TOGGLE from './drawer.action.types'

const initialState = {
    drawer: false,
}

function drawerReducer(state = cloneDeep(initialState), action: { type: any, payload: boolean }) {
    switch (action.type) {
        case DRAWER_TOGGLE.DRAWER: {
            state.drawer = action.payload;
            return {
                ...state
            }
        }
        default:
            return state;
    }
}

export default drawerReducer;