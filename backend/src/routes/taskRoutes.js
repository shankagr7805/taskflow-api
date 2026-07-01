const express = require("express");
const taskController = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { taskCreateRules, taskUpdateRules, idParamRule } = require("../middleware/validators");

const router = express.Router();

router.use(protect); // every route below requires a valid JWT

router.route("/").post(taskCreateRules, taskController.createTask).get(taskController.getTasks);

router
  .route("/:id")
  .get(idParamRule, taskController.getTask)
  .put(taskUpdateRules, taskController.updateTask)
  .delete(idParamRule, taskController.deleteTask);

module.exports = router;
