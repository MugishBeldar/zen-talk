const bcrypt = require("bcryptjs");
const jwtAuth = require("../app-auth");
class Auth {
  async userAuthenticate(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
          type: "validation error",
        });
      }
      const user = await req.App.activeDB.User.findOne({ email });
      if(!user) {
        return res.status(404).json({
          success: false,
          message: "User not found please register",
          type: "validation error",
        })
      }
      const rowPassword = await bcrypt.compare(password, user.password);
      if (user && rowPassword) {
        const jwtAuthObj = new jwtAuth();
        const { accessToken, refreshToken, expiresIn } =
          await jwtAuthObj.gererateToken({ id: user._id });
        return res.status(200).json({
          success: true,
          message: "login successful",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
            refreshToken,
            expiresIn,
          },
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async registerUser(req, res) {
    try {
      const { name, email, password, profilePicture } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
          type: "validation error",
        });
      }
      const existingUser = await req.App.activeDB.User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
          type: "duplicate entry",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const storeUserInDB = await req.App.activeDB.User.create({
        name,
        email,
        password: hashPassword,
        profilePic: profilePicture,
      });

      console.log(storeUserInDB);

      const {
        name: storedName,
        email: storedEmail,
        createdAt,
        updatedAt,
      } = storeUserInDB;

      res.status(201).json({
        success: true,
        message: "User Created",
        data: { name: storedName, email: storedEmail, createdAt, updatedAt },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        type: "internal error",
      });
    }
  }
}

module.exports = new Auth();
