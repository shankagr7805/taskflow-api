const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [1, 120] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "done"),
      allowNull: false,
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

// a task belongs to whoever created it, an admin can still see/manage all of them
Task.belongsTo(User, { as: "owner", foreignKey: { name: "ownerId", allowNull: false } });
User.hasMany(Task, { as: "tasks", foreignKey: "ownerId" });

module.exports = Task;
