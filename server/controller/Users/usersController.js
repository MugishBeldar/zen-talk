const bcrypt = require("bcryptjs");
const { gererateToken } = require("../../util/generateToken");
const User = require("../../model/User/User");
const ApiError = require("../../hepler/ApiError");
const ApiResponse = require("../../hepler/ApiResponse");
const { sendError, sendResponse } = require("../../util/api-handler");
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
      return sendError(res, 400, "Email and Password is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "User not found please register");
    }
    const rowPassword = await bcrypt.compare(password, user.password);
    if (user && rowPassword) {
      const { accessToken, refreshToken, expiresIn } = await gererateToken({
        id: user._id,
      });
      const data = {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        accessToken,
        refreshToken,
        expiresIn,
      };
      return sendResponse(res, 200, data);
    } else {
      return sendError(res, 401, "Invalid credentials");
    }
  } catch (err) {
    return sendError(res, 401, "Invalid credentials", err);
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
    const { name, email, password, profilePicture } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, Email and Password required");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "Email already exists");
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
    const data = { name: storedName, email: storedEmail, createdAt, updatedAt };
    return sendResponse(res, 201, data);
  } catch (error) {
    return sendError(res, 500, "Internal server error", err);
  }
};

const getUsers = async (req, res) => {
  try {
    const { name, email } = req.query;
    const { user } = req;
    const query = buildQuery(name, email, user._id);
    const users = await User.find(query).select("-password");
    return sendResponse(res, 200, users);
  } catch (error) {
    return sendError(res, 500, "Internal server error", err);
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
      return sendError(res, 400, "Name and Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    const updateObj = { name };
    if (profilePic) {
      updateObj.profilePic = profilePic;
    }
    const updateUser = await User.findByIdAndUpdate(user._id, updateObj, {
      new: true,
    }).select("-password");
    return sendResponse(res, 200, updateUser);
  } catch (error) {
    return sendError(res, 500, "Internal server error", err);
  }
};
module.exports = {
  userAuthenticate,
  registerUser,
  getUsers,
  updateUserInfo,
};
