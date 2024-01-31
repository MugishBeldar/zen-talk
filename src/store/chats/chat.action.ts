/* eslint-disable no-labels */
/* eslint-disable no-unused-expressions */
// import AUTH_ACTION from './auth.action.types'
import SET_CHATS from './chat.action.types'

export const chats = (value:any) => ({
    type: SET_CHATS.SET,
    payload: value,
})

// export const signUp = () => ({
//     type: AUTH_ACTION.SIGNUP
// })