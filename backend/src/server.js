require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");
require("./models/User");
require("./models/Task");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log(`Database connection OK (${process.env.DB_DIALECT || "mysql"})`);

    // sync is fine for an assignment/demo project, a real production app
    // would use migrations instead of letting sequelize alter tables itself
    await sequelize.sync();
    console.log("Models synced");

    app.listen(PORT, () => {
      console.log(`TaskFlow API listening on http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
