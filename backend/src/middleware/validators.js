const { body, param, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// runs after the rule chains below and turns any failures into a 400
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(new AppError(message, 400));
  }
  next();
}

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 60 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  checkValidation,
];

const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  checkValidation,
];

const taskCreateRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
  body("description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("status").optional().isIn(["pending", "in_progress", "done"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  checkValidation,
];

const taskUpdateRules = [
  param("id").isInt().withMessage("Task id must be a number"),
  body("title").optional().trim().notEmpty().isLength({ max: 120 }),
  body("description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("status").optional().isIn(["pending", "in_progress", "done"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  checkValidation,
];

const idParamRule = [param("id").isInt().withMessage("Id must be a number"), checkValidation];

module.exports = {
  registerRules,
  loginRules,
  taskCreateRules,
  taskUpdateRules,
  idParamRule,
};
