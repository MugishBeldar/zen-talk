import React, { useState } from "react";
import {
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SignUpController from "./signup.controller";
import { useSelector } from "react-redux";

const Signup = () => {
  const [formValue, setFormValue] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const buttonLoadingIndicator = useSelector(
    (state: any) => state.loadingIndicatorstate.clicked
  );
  const { handleSubmit, handleTogglePasswordVisibility, handleChange } =
    SignUpController({
      formValue,
      setShowPassword,
      setFormValue,
      setLoading,
    });

  return (
    <div className="flex justify-center m-5">
      <Paper elevation={3} className="p-6 sm:w-[40%]">
        <form onSubmit={handleSubmit}>
          <TextField
            required
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.name}
            onChange={(e) => handleChange(e, "name", e.target.value)}
            size="small"
          />
          <TextField
            required
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.email}
            onChange={(e) => handleChange(e, "email", e.target.value)}
            size="small"
            error={
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.email) &&
              formValue.email.length > 0
            }
            helperText={
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.email) &&
              formValue.email.length > 0
                ? "Enter a valid email address"
                : ""
            }
          />
          <TextField
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.password}
            onChange={(e) => handleChange(e, "password", e.target.value)}
            size="small"
            error={
              formValue.password.length < 8 && formValue.password.length > 0
            }
            helperText={
              formValue.password.length < 8 && formValue.password.length > 0
                ? "Password must be at least 8 characters"
                : ""
            }
          />
          <TextField
            required
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.confirmPassword}
            onChange={(e) => handleChange(e, "confirmPassword", e.target.value)}
            size="small"
            error={
              formValue.confirmPassword !== formValue.password &&
              formValue.password !== "" &&
              formValue.confirmPassword !== ""
            }
            helperText={
              formValue.confirmPassword !== formValue.password &&
              formValue.password !== "" &&
              formValue.confirmPassword !== ""
                ? "Passwords do not match"
                : ""
            }
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
            id="contained-button-file"
            focused
            label="Upload Picture"
            type="file"
            variant="standard"
            fullWidth
            margin="normal"
            value={formValue.profilePicture}
            onChange={(e) => {
              handleChange(e, "profilePicture", e.target.value);
            }}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <img
                      className="w-14"
                      src={require("../../assets/Spinner-1s-200px.gif")}
                      alt="loading..."
                    />
                  ) : null}
                </InputAdornment>
              ),
            }}
          />
          <LoadingButton
            disabled={loading}
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            loading={buttonLoadingIndicator}
            loadingPosition="center"
            loadingIndicator=<CircularProgress color="success" size={16} />
          >
            Sign Up
          </LoadingButton>
        </form>
      </Paper>
    </div>
  );
};

export default Signup;
