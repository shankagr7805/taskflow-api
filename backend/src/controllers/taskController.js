const { Op } = require("sequelize");
const Task = require("../models/Task");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getCache, setCache, clearCache } = require("../config/cache");

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [pending, in_progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201: { description: Task created }
 */
exports.createTask = catchAsync(async (req, res) => {
  const { title, description, status, priority } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    ownerId: req.user.id,
  });

  await clearCache(`tasks:${req.user.id}:*`);

  res.status(201).json({ success: true, task });
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks (own tasks for a user, all tasks for an admin)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of tasks }
 */
exports.getTasks = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.status) where.status = req.query.status;

  // regular users only ever see their own tasks, admins can see everyone's
  if (req.user.role !== "admin") {
    where.ownerId = req.user.id;
  } else if (req.query.ownerId) {
    where.ownerId = req.query.ownerId;
  }

  const cacheKey = `tasks:${req.user.id}:${JSON.stringify(req.query)}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, fromCache: true, ...cached });
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: { model: User, as: "owner", attributes: ["id", "name", "email"] },
  });

  const payload = {
    tasks: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };

  await setCache(cacheKey, payload);

  res.status(200).json({ success: true, ...payload });
});

async function findTaskOr404(id) {
  const task = await Task.findByPk(id, {
    include: { model: User, as: "owner", attributes: ["id", "name", "email"] },
  });
  if (!task) throw new AppError("Task not found", 404);
  return task;
}

function assertOwnerOrAdmin(req, task) {
  if (req.user.role !== "admin" && task.ownerId !== req.user.id) {
    throw new AppError("You don't have permission to access this task", 403);
  }
}

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task found }
 *       404: { description: Not found }
 */
exports.getTask = catchAsync(async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  assertOwnerOrAdmin(req, task);
  res.status(200).json({ success: true, task });
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task updated }
 *       404: { description: Not found }
 */
exports.updateTask = catchAsync(async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  assertOwnerOrAdmin(req, task);

  const { title, description, status, priority } = req.body;
  await task.update({
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
  });

  await clearCache(`tasks:${task.ownerId}:*`);

  res.status(200).json({ success: true, task });
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task deleted }
 *       404: { description: Not found }
 */
exports.deleteTask = catchAsync(async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  assertOwnerOrAdmin(req, task);

  await task.destroy();
  await clearCache(`tasks:${task.ownerId}:*`);

  res.status(200).json({ success: true, message: "Task deleted" });
});
