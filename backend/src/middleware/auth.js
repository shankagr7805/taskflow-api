const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// checks the Authorization header, verifies the JWT, and attaches the
// logged in user to req.user so downstream handlers can use it
const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You must be logged in to do that", 401));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(new AppError("Invalid or expired token, please log in again", 401));
  }

  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user for this token no longer exists", 401));
  }

  req.user = currentUser;
  next();
});

// usage: restrictTo('admin') or restrictTo('admin', 'user')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to perform this action", 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
