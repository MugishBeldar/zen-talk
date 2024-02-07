const bcrypt = require("bcryptjs");
const { gererateToken } = require("../../util/generateToken");
const User = require("../../model/User/User");

/**
 * Authenticates user for login.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Promise representing the completion of the authentication process.
 */
const userAuthenticate = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
        type: "validation error",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found please register",
        type: "validation error",
      });
    }
    const rowPassword = await bcrypt.compare(password, user.password);
    if (user && rowPassword) {
      const { accessToken, refreshToken, expiresIn } = await gererateToken({
        id: user._id,
      });
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
    console.log("🚀 ~ userAuthenticate ~ error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Registers a new user.
 * @param {object} req - Express request object containing user details in the body.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Promise representing the completion of the user registration process.
 */
const registerUser = async (req, res) => {
  try {
    // Extract user details from request body
    console.log(req.body);
    const { name, email, password, profilePicture } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
        type: "validation error",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        type: "duplicate entry",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      profilePic: profilePicture,
    });

    const {
      name: storedName,
      email: storedEmail,
      createdAt,
      updatedAt,
    } = newUser;

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
};

const getUsers = async (req, res) => {
  try {
    const { name, email } = req.query;
    const { user } = req;

    const query = buildQuery(name, email, user._id);

    const users = await User.find(query).select("-password");

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
};

const buildQuery = (name, email, userId) => {
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
};

const updateUserInfo = async (req, res) => {
  try {
    const { name, email, profilePic } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and email",
        type: "validation error",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found please register",
        type: "validation error",
      });
    }
    const updateObj = { name };
    if (profilePic) {
      updateObj.profilePic = profilePic;
    }
    const updateUser = await User.findByIdAndUpdate(user._id, updateObj, {
      new: true,
    }).select("-password");
    return res.status(200).json({
      success: true,
      message: "user info updated successfully",
      data: updateUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
module.exports = {
  userAuthenticate,
  registerUser,
  getUsers,
  updateUserInfo,
};
