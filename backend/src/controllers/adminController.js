const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of users }
 *       403: { description: Not an admin }
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({ attributes: ["id", "name", "email", "role", "createdAt"] });
  res.status(200).json({ success: true, count: users.length, users });
});

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Change a user's role (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Role updated }
 *       404: { description: User not found }
 */
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return next(new AppError("Role must be either 'user' or 'admin'", 400));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  user.role = role;
  await user.save();

  res.status(200).json({ success: true, user: user.toSafeObject() });
});
