import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Initalizing the Sequelize instance
// same as webapp
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER_NAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST_URL,
    dialect: "postgres",
  }
);
