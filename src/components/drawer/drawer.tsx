import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Drawer from '@mui/material/Drawer';
type Anchor = 'top' | 'left' | 'bottom' | 'right';
const AppDrawer = () => {

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  

  const toggleDrawer =
  (anchor: Anchor, open: boolean) =>
  (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  return (
    // <div onClick={toggleDrawer(anchor, true)} className="sm:border sm:border-sky-500 sm:rounded-lg sm:w-44 sm:h-8 flex items-center hover:cursor-pointer">
    //   <SearchIcon fontSize="medium" className="sm:ml-[4%] text-gray-400" />
    //   <p className="ml-2 text-gray-400 hidden sm:block">Search</p>
    //   <Drawer
    //         anchor={anchor}
    //         open={state[anchor]}
    //         onClose={toggleDrawer(anchor, false)}
    //       >
    //         {list(anchor)}
    //       </Drawer>
    // </div>
    <></>
  );
};

export default AppDrawer;
