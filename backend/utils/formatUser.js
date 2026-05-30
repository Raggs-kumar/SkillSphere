const formatUser = (user, includeToken = false) => {
  if (!user) return null;

  const payload = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (includeToken && user.token) {
    payload.token = user.token;
  }

  return payload;
};

module.exports = formatUser;
