const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const formatUser = require('../utils/formatUser');
const { getJwtSecret } = require('../config/env');
const {
  REGISTER_ROLES,
  EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  ADMIN_EMAIL_DOMAIN,
} = require('../constants');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, getJwtSecret(), { expiresIn: '30d' });

const registerUser = async (body) => {
  const { name, username, email, password, confirmPassword, role } = body;

  if (!name || !username || !email || !password || !confirmPassword || !role) {
    throw new ApiError(400, 'All fields are required');
  }
  if (!REGISTER_ROLES.includes(role)) {
    throw new ApiError(400, 'Registration is only allowed for Clients and Freelancers');
  }
  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    throw new ApiError(
      400,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const [emailExists, usernameExists] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ username: normalizedUsername }),
  ]);

  if (emailExists) throw new ApiError(400, 'Email is already registered');
  if (usernameExists) throw new ApiError(400, 'Username is already taken');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    isVerified: false,
  });

  const token = generateToken(user._id, user.role);
  return formatUser({ ...user.toObject(), token }, true);
};

const loginUser = async (body) => {
  const { emailOrUsername, password } = body;

  if (!emailOrUsername || !password) {
    throw new ApiError(400, 'Please provide email/username and password');
  }

  const searchKey = emailOrUsername.toLowerCase();
  const user = await User.findOne({
    $or: [{ email: searchKey }, { username: searchKey }],
  });

  if (!user) throw new ApiError(401, 'Invalid credentials');

  if (user.role === 'admin' && !user.email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN)) {
    throw new ApiError(403, 'Admin login rejected. Admin emails must end with @skillsphere.net');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const token = generateToken(user._id, user.role);
  return formatUser({ ...user.toObject(), token }, true);
};

module.exports = { registerUser, loginUser };
