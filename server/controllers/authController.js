const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const { sendVerificationEmail } = require("../utils/sendEmail");

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyToken,
      verifyTokenExpiry,
    });

    // Send verification email
    await sendVerificationEmail(email, verifyToken);

    res.json({
      message: "Account created! Please check your email to verify your account.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id, user.name),
      name: user.name,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    // Redirect to frontend login page after verification
    res.redirect(`${process.env.CLIENT_URL}/verified`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD (kept simple)
exports.forgotPassword = async (req, res) => {
  res.json({ message: "Password reset not available in this version" });
};

// RESET PASSWORD (kept simple)
exports.resetPassword = async (req, res) => {
  res.json({ message: "Password reset not available in this version" });
};
