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

// User Model, same as webapp
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isUserVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationMailTimeStamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    // By default, sequelize will automatically add the attributes createdAt and updatedAt to the model
    // since we want to change the names, we can do so as shown
    // followed official documentation for the change https://sequelize.org/docs/v6/core-concepts/model-basics/#timestamps
    createdAt: "account_created",
    updatedAt: "account_updated",
    tableName: "users",
  }
);
