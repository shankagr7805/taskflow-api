const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

module.exports = router;
