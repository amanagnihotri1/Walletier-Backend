const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/email");

// 1. Password Reset Request (Forgot Password)
const passwordRequest = async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ success: false, message: "Email address is required." });
  }
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    // Single-use token: Secret includes the user's current hashed password
    const secret = process.env.SESSION_SECRET + user.password;
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      secret,
      { expiresIn: "1h" }
    );

    // Build reset URL using CLIENT_URL / PROD_URL or host
    const clientBaseUrl = `${process.env.CLIENT_URL}`;
    const resetURL = `${clientBaseUrl}/passwordreset/${user._id}/${token}`;
    await sendPasswordResetEmail({
      email: user.email,
      name: user.fullName || "User",
      resetURL,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Error in passwordRequest:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to process password reset request." });
  }
};

// 3. Password Reset Execution
const passwordReset = async (req, res) => {
  const id = req.params.id || req.body.id || req.body.userId;
  const token = req.params.token || req.body.token;
  const { password, newPassword, confirmPassword } = req.body;

  const targetPassword = password || newPassword;

  if (!id || !token) {
    return res.status(400).json({ success: false, message: "User ID and token are required." });
  }

  if (!targetPassword) {
    return res.status(400).json({ success: false, message: "New password is required." });
  }

  if (typeof targetPassword !== "string" || targetPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  if (confirmPassword && targetPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID format." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not exists!" });
    }

    // Verify token with user's current password hash
    const secret = process.env.SESSION_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(400).json({ success: false, message: "Password reset link has expired. Please request a new one." });
      }
      return res.status(400).json({ success: false, message: "Invalid or already used password reset link." });
    }

    // Hash the new password and update user
    const encryptedPassword = await bcrypt.hash(targetPassword, 10);
    user.password = encryptedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password has been reset" });
  } catch (error) {
    console.error("Error in passwordReset:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const signup = async (req, res) => {
  const { useremail, email, userpassword, password, userName, fullName, profilepicture, avatar, userId, access_token } = req.body;
  const targetEmail = (useremail || email || "").toLowerCase().trim();
  const targetPassword = userpassword || password;
  const targetName = userName || fullName || "";

  if (!targetEmail || !targetPassword) {
    return res.status(400).json({ status: "Failed", message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email: targetEmail });
    if (existingUser) {
      return res.status(400).json({ status: "Failed", message: "User already exists with this email address" });
    }

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(targetPassword, saltRounds);
    const userDoc = new User({
      fullName: targetName,
      email: targetEmail,
      password: encryptedPassword,
      avatar: profilepicture || avatar || "",
      google: {
        id: userId,
        token: access_token,
      },
    });
    await userDoc.save();
    return res.status(201).json({ status: "success", data: "User Created Successfully", message: userDoc });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ status: "Failed", message: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { userEmail, email, userPass, password } = req.body;
    const targetEmail = (userEmail || email || "").toLowerCase().trim();
    const targetPassword = userPass || password;

    if (!targetEmail || !targetPassword) {
      return res.status(400).json({ status: "Failed", message: "Email and password are required" });
    }

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ status: "Failed", message: "User does not exist with this email address" });
    }

    const matchPassword = await bcrypt.compare(targetPassword, user.password);
    if (!matchPassword) {
      return res.status(401).json({ status: "Failed", message: "Incorrect password" });
    }

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.SESSION_SECRET, { expiresIn: "24h" });
    return res
      .cookie("token", token, { httpOnly: true, secure: true, sameSite: "None" })
      .status(200)
      .json({ token, userDetails: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ status: "Failed", message: err.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ status: "success", message: "logged out successfully" });
};

module.exports = {
  userLogin,
  signup,
  logout,
  passwordReset,
  passwordRequest,
};