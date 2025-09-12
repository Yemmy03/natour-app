const _ = require('lodash');
const { messages } = require('./helpers/constants');
const { ConfigurationError } = require('./helpers/error');

function getEnvVar(key, required = true, parseIntFlag = false) {
  const value = process.env[key.toUpperCase()];
  if (required && (value === undefined || value === '')) {
    throw new ConfigurationError(messages.CONFIG_MSG(key));
  }
  return parseIntFlag ? parseInt(value, 10) : value;
}

const baseConfig = {
  currentEnvironment: getEnvVar('NODE_ENV'),
  appPort: getEnvVar('PORT', true, true),
  mongoDatabaseProduction: getEnvVar('MONGO_DATABASE_PRODUCTION'),
  mongoDatabaseLocal: getEnvVar('MONGO_DATABASE_LOCAL'),
  mongoPassword: getEnvVar('MONGO_PASSWORD'),
  redisServerUrl: getEnvVar('REDIS_SERVER_URL'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpires: getEnvVar('JWT_EXPIRES'),
  jwtCookieExpires: getEnvVar('JWT_COOKIE_EXPIRES', true, true),
  jwtAlgorithm: getEnvVar('JWT_ALGORITHM'),
  refreshJwtSecret: getEnvVar('JWT_REFRESH_SECRET'),
  refreshJwtExpires: getEnvVar('JWT_REFRESH_EXPIRES'),
  refreshJwtCookieExpires: getEnvVar('JWT_REFRESH_COOKIE_EXPIRES', true, true),
  refreshJwtAlgorithm: getEnvVar('JWT_REFRESH_ALGORITHM'),
  emailUsername: getEnvVar('EMAIL_USERNAME'),
  emailPassword: getEnvVar('EMAIL_PASSWORD'),
  emailHost: getEnvVar('EMAIL_HOST'),
  emailPort: getEnvVar('EMAIL_PORT', true, true),
  mongoUseLocal: getEnvVar('MONGO_USE_LOCAL') === 'true',
  twilioAccountSid: getEnvVar('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: getEnvVar('TWILIO_AUTH_TOKEN'),
  twilioPhoneNumber: getEnvVar('TWILIO_PHONE_NUMBER'),
  redisDeleteTime: getEnvVar('REDIS_DELETE_TIME', true, true),
  admins: JSON.parse(getEnvVar('ADMINS')),
  imageHeight: getEnvVar('IMAGE_HEIGHT', true, true),
  imageWidth: getEnvVar('IMAGE_WIDTH', true, true),
  imageQuality: getEnvVar('IMAGE_QUALITY', true, true),
  emailSender: getEnvVar('EMAIL_SENDER'),
  sendgridUsername: getEnvVar('SENDGRID_USERNAME', false),
  sendgridPassword: getEnvVar('SENDGRID_PASSWORD', false),
  stripeSecretKey: getEnvVar('STRIPE_SECRET_KEY'),
  stripePublishableKey: getEnvVar('STRIPE_PUBLISHABLE_KEY'),
  redisProductionServerUrl: getEnvVar('REDIS_PRODUCTION_SERVER_URL'),
};

module.exports = baseConfig;

