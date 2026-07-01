const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { signToken } = require("../utils/jwt");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Shankar Kumar }
 *               email: { type: string, example: shankar@example.com }
 *               password: { type: string, example: mypassword123 }
 *               adminCode: { type: string, description: "optional, only for creating an admin account" }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, adminCode } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return next(new AppError("That email is already registered", 409));
  }

  const role =
    adminCode && process.env.ADMIN_SIGNUP_CODE && adminCode === process.env.ADMIN_SIGNUP_CODE
      ? "admin"
      : "user";

  const user = await User.create({ name, email, password, role });
  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Wrong email or password }
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user);
  res.status(200).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently logged in user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Not logged in }
 */
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});
