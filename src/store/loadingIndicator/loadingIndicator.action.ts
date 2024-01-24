/* eslint-disable no-labels */
/* eslint-disable no-unused-expressions */
// import AUTH_ACTION from './auth.action.types'
import LOADING_INDICATOR from './loadingIndicator.action.types'

export const clicked = (value:boolean) => ({
    type: LOADING_INDICATOR.CLICKED,
    payload: value,
})

// export const signUp = () => ({
//     type: AUTH_ACTION.SIGNUP
// })