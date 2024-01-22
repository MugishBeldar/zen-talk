import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SignUpController from "./signup.controller";

const Signup = () => {
  const [formValue, setFormValue] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, handleTogglePasswordVisibility, handleChange } =
    SignUpController({
      formValue,
      setShowPassword,
      setFormValue,
    });

  return (
    <div className="flex justify-center mt-5">
      <Paper elevation={3} className="p-6 w-[50%]">
        <form onSubmit={handleSubmit}>
          <TextField
            required
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.name}
            onChange={(e) => handleChange("name", e.target.value)}
            size="small"
          />
          <TextField
            required
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="small"
          />
          <TextField
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.password}
            onChange={(e) => handleChange("password", e.target.value)}
            size="small"
          />
          <TextField
            required
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            focused
            label="Upload Picture"
            type="file"
            variant="standard"
            fullWidth
            margin="normal"
            value={formValue.profilePicture}
            onChange={(e) => handleChange("profilePicture", e.target.value)}
            size="small"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
          >
            Sign Up
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Signup;
