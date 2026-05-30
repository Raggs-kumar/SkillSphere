const ROLES = ['client', 'freelancer', 'admin'];
const REGISTER_ROLES = ['client', 'freelancer'];
const ADMIN_EMAIL_DOMAIN = '@skillsphere.net';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PROJECT_STATUS = ['open', 'active', 'under_review', 'completed', 'flagged', 'rejected'];
const PROPOSAL_STATUS = ['pending', 'accepted', 'rejected'];

module.exports = {
  ROLES,
  REGISTER_ROLES,
  ADMIN_EMAIL_DOMAIN,
  EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  PROJECT_STATUS,
  PROPOSAL_STATUS,
};
