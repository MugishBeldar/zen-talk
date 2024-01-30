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
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found please register",
          type: "validation error",
        });
      }
      const rowPassword = await bcrypt.compare(password, user.password);
      if (user && rowPassword) {
        const { accessToken, refreshToken, expiresIn } =
          await jwtAuth.gererateToken({ id: user._id });
        return res.status(200).json({
          success: true,
          message: "login successful",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
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

  async getUsers(req, res) {
    try {
      const { name, email } = req.query;
      const { App, user } = req;

      const query = this.buildQuery(name, email, user._id);

      const users = await App.activeDB.User.find(query).select('-password');

      res.status(201).json({
        success: true,
        totalCount: users.length,
        message: "Users Fetched",
        data: users,
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

  buildQuery(name, email, userId) {
    const query = {};
    if (name || email) {
      query.$or = [];

      if (name) {
        query.$or.push({ name: { $regex: name, $options: "i" } });
      }
      if (email) {
        query.$or.push({ email: { $regex: email, $options: "i" } });
      }
    }
    if (userId) {
      query._id = { $ne: userId };
    }
    return query;
  }
}

module.exports = new Auth();
