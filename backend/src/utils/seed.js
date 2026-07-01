require("dotenv").config();
const sequelize = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");

async function seed() {
  await sequelize.sync({ force: true }); // wipes and recreates tables, seed script only

  const admin = await User.create({
    name: "Admin",
    email: "admin@taskflow.dev",
    password: "admin1234",
    role: "admin",
  });

  const user = await User.create({
    name: "Demo User",
    email: "user@taskflow.dev",
    password: "user1234",
    role: "user",
  });

  await Task.bulkCreate([
    { title: "Set up project repo", status: "done", priority: "high", ownerId: user.id },
    { title: "Write API documentation", status: "in_progress", priority: "medium", ownerId: user.id },
    { title: "Deploy to staging", status: "pending", priority: "high", ownerId: admin.id },
  ]);

  console.log("Seed complete:");
  console.log("  admin -> admin@taskflow.dev / admin1234");
  console.log("  user  -> user@taskflow.dev / user1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
