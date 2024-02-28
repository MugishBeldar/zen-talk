import React from "react";
import leftArrow from '../../assets/left-arrow.svg';
import rightArrow from "../../assets/right-arrow.svg";
import { useDispatch, useSelector } from "react-redux";
import { drawerToggle } from "../../store/drawer/drawer.action";

const Drawer = ({ chatList }: any) => {
    const dispatch = useDispatch();
    const drawer = useSelector((state: any) => state.drawerState.drawer);

    return (
        <div className="flex overflow-y-auto">
            {drawer &&
                <div className="w-full">
                    {chatList}
                </div>
            }
            <div onClick={() => dispatch(drawerToggle(!drawer))} className="w-11">
                {drawer ? <img src={leftArrow} alt="" /> : <img src={rightArrow} alt="" />}
            </div>
        </div>
    );
}

export default Drawer;
