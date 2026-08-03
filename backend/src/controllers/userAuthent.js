const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");

// Shared cookie options — production-ready (HTTPS + cross-site)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 60 * 60 * 1000, // 1 hour
};

const register = async (req, res) => {
  try {
    try {
      validate(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'user';

    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId, role: 'user' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: reply, message: "Registered Successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) throw new Error("Invalid Credentials");
    if (!password) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid Credentials");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: reply, message: "Login Successfully" });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
};

// Logout — blacklist token in Redis, clear cookie
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, 'Blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (err) {
    res.status(503).json({ message: "Logout failed: " + err.message });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ message: "Admin Registered Successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Admin registration failed' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Profile Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };
