import { useState } from "react";
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
import RegisterController from "./register.controller";
import { useSelector } from "react-redux";
import Tabs from "../tabs/tabs";
import { styled } from "@mui/material/styles";

const CustomeTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#075E54",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#075E54",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#075E54",
    },
  },
});

const Register = () => {
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
    RegisterController({
      formValue,
      setShowPassword,
      setFormValue,
      setLoading,
    });

  return (
    <div className="flex justify-center items-center m-5 h-screen">
      <Paper
        elevation={3}
        className="p-6 sm:w-[33%]"
        sx={{ borderRadius: "15px", backgroundColor: "whitesmoke" }}
      >
        <Tabs />
        <form onSubmit={handleSubmit}>
          <CustomeTextField
            required
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.name}
            onChange={(e) => handleChange(e, "name", e.target.value)}
            size="small"
          />
          <CustomeTextField
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
          <CustomeTextField
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
          <CustomeTextField
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
          <CustomeTextField
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
            sx={{
              backgroundColor: "#075e54",
              ":hover": {
                backgroundColor: "#05bda8",
              },
            }}
            disabled={loading}
            type="submit"
            variant="contained"
            size="small"
            loading={buttonLoadingIndicator}
            loadingPosition="center"
            loadingIndicator=<CircularProgress
              sx={{ color: "#040404" }}
              size={16}
            />
          >
            Register
          </LoadingButton>
        </form>
      </Paper>
    </div>
  );
};

export default Register;
