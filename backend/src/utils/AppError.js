// A small helper so controllers can throw a plain error with a status code
// attached, instead of manually building { message, statusCode } every time.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
