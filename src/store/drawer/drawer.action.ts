import DRAWER_TOGGLE from './drawer.action.types'

export const drawerToggle = (value:boolean) => ({
    type: DRAWER_TOGGLE.DRAWER,
    payload: value,
})