const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const formatUser = require('../utils/formatUser');
const { EMAIL_REGEX, ADMIN_EMAIL_DOMAIN } = require('../constants');

const updateProfile = async (user, body) => {
  const { name, username, email, avatar } = body;

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;

  if (email && email.toLowerCase() !== user.email) {
    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, 'Please enter a valid email address');
    }
    if (user.role === 'admin' && !email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN)) {
      throw new ApiError(400, 'Admin email must end with @skillsphere.net');
    }
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) throw new ApiError(400, 'Email is already taken');
    user.email = email.toLowerCase();
  }

  if (username && username.toLowerCase() !== user.username) {
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) throw new ApiError(400, 'Username is already taken');
    user.username = username.toLowerCase();
  }

  const updatedUser = await user.save();
  return formatUser(updatedUser);
};

const getAllUsers = async (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

module.exports = { updateProfile, getAllUsers };
