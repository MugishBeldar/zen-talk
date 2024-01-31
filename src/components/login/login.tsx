import { useState } from "react";
import {
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginController from "./login.controller";
import { LoadingButton } from "@mui/lab";
import { useSelector } from "react-redux";
import Tabs from "../tabs/tabs";

const Login = () => {
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const buttonLoadingIndicator = useSelector(
    (state: any) => state.loadingIndicatorstate.clicked
  );

  const { handleSubmit, handleTogglePasswordVisibility, handleChange } =
    LoginController({
      formValue,
      setShowPassword,
      setFormValue,
    });

  return (
    <div className="flex justify-center items-center h-screen mt-5">
      <Paper elevation={3} className="p-6">
        <Tabs />
        <form onSubmit={handleSubmit}>
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
          <LoadingButton
            type="submit"
            variant="contained"
            color="success"
            size="small"
            loading={buttonLoadingIndicator}
            loadingPosition="center"
            loadingIndicator=<CircularProgress color="primary" size={16} />
          >
            Login
          </LoadingButton>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
