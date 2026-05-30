const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: 'API resource not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' && !err.isOperational ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
