/* eslint-disable no-labels */
/* eslint-disable no-unused-expressions */
// import AUTH_ACTION from './auth.action.types'
import IS_EDIT from './edit.action.types'

export const edit = (value:boolean) => ({
    type: IS_EDIT.EDIT,
    payload: value,
})

// export const signUp = () => ({
//     type: AUTH_ACTION.SIGNUP
// })