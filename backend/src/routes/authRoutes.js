const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { registerRules, loginRules } = require("../middleware/validators");
const { protect } = require("../middleware/auth");

const router = express.Router();

// slow down brute-force login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, try again later" },
});

router.post("/register", registerRules, authController.register);
router.post("/login", loginLimiter, loginRules, authController.login);
router.get("/me", protect, authController.getMe);

module.exports = router;
