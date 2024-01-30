/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import searchController from "./search.controller";
import { userTypes } from "../../types";
import { Autocomplete } from "@mui/material";

const SearchUser = () => {
  const [users, setUsers] = useState<userTypes[]>([]);
  const { handleInputSearch } = searchController({ setUsers });

  const handleUserChange = (event: any, newValue: userTypes | null) => {
    // setSelectedUser(newValue);
    // You can now access the selected user details in the 'selectedUser' state
    if (newValue) {
      console.log("Selected User:", newValue);
    }
  };

  return (
    <div className=" w-40 sm:w-80 ">
      <Autocomplete
        freeSolo
        // onSelect={(user)=>{console.log(user)}}
        size="small"
        onInputChange={handleInputSearch}
        disableClearable
        options={users.map((user) => user)}
        //@ts-ignore
        onChange={handleUserChange}
        //@ts-ignore
        getOptionLabel={(user) => user.name} // Specify the property to be used as the label
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search user"
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
        renderOption={(props, user: userTypes) => (
          <li {...props}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={
                  user.profilePic
                    ? user.profilePic
                    : `https://ui-avatars.com/api/?background=random&name=${user.name}`
                }
                alt={`Image for ${user.name}`}
                style={{
                  borderRadius: "50%",
                  marginRight: "8px",
                  width: "50px",
                  height: "50px",
                }}
              />
              {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
            </div>
          </li>
        )}
      />
    </div>
  );
};

export default SearchUser;
