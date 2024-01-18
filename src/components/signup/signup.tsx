import React, { FormEvent, useState } from "react";
import { TextField, Button, Paper } from "@mui/material";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Username:", email);
    console.log("Password:", password);
    // Add logic for authentication
  };

  return (
    <div className="flex justify-center mt-5">
      <Paper elevation={3} className="p-6 max-w-s">
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            color="success"
            size="small"
          >
            Sign-Up
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Signup;
