/**
 * Centralized environment configuration.
 * Production requires explicit secrets; development allows a local MongoDB default only.
 */

const isProduction = process.env.NODE_ENV === 'production';

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.error(`FATAL: ${name} is required but not set. Copy .env.example to .env and configure it.`);
    process.exit(1);
  }
  return String(value).trim();
};

const getMongoUri = () => {
  if (isProduction) {
    return requireEnv('MONGO_URI');
  }
  return process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillsphere';
};

const getJwtSecret = () => requireEnv('JWT_SECRET');

const getAdminSeedConfig = () => ({
  email: process.env.ADMIN_EMAIL || 'admin@skillsphere.net',
  username: process.env.ADMIN_USERNAME || 'skillsphere_admin',
  password: requireEnv('ADMIN_PASSWORD'),
});

module.exports = {
  isProduction,
  requireEnv,
  getMongoUri,
  getJwtSecret,
  getAdminSeedConfig,
};
