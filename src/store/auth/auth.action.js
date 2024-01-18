/* eslint-disable no-labels */
/* eslint-disable no-unused-expressions */
import AUTH_ACTION from './auth.action.types'

export const logIn = () => ({
    type: AUTH_ACTION.LOGIN
})

export const signUp = () => ({
    type: AUTH_ACTION.SIGNUP
})