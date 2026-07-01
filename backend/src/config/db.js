const { Sequelize } = require("sequelize");

// mysql or postgres — both take the same connection shape via Sequelize
const dialect = process.env.DB_DIALECT || "mysql";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect,
    logging: false,
    pool: { max: 10, min: 0, idle: 10000 },
  }
);

module.exports = sequelize;
