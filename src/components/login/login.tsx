import { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginController from "./login.controller";

const Login = () => {
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, handleTogglePasswordVisibility, handleChange } =
    LoginController({
      formValue,
      setShowPassword,
      setFormValue,
    });

  return (
    <div className="flex justify-center mt-5">
      <Paper elevation={3} className="p-6 w-[90%]">
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
          >
            Login
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
