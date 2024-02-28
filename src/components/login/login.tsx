import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { TextField, Paper, InputAdornment, IconButton, CircularProgress, } from "@mui/material";

import Tabs from "../tabs/tabs";
import LoginController from "./login.controller";

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

const Login = () => {
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const buttonLoadingIndicator = useSelector((state: any) => state.loadingIndicatorstate.clicked);

  const { handleSubmit, handleTogglePasswordVisibility, handleChange } =
    LoginController({
      formValue,
      setShowPassword,
      setFormValue,
    });

  return (
    <div className="flex justify-center items-center h-screen mt-5">
      <Paper elevation={3} className="p-6" sx={{ borderRadius: "15px", backgroundColor: "whitesmoke" }}>
        <Tabs />
        <form onSubmit={handleSubmit}>
          <CustomeTextField
            sx={{
              border: "#040404",
            }}
            required
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValue.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="small"
          />
          <CustomeTextField
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
            sx={{
              backgroundColor: "#075e54",
              ":hover": {
                backgroundColor: "#05bda8",
              },
            }}
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
            Login
          </LoadingButton>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
