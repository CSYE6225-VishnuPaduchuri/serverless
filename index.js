import { cloudEvent } from "@google-cloud/functions-framework";
import { Sequelize, DataTypes } from "sequelize";
import mailgun from "mailgun-js";
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

const mailGunApiKey = process.env.MAILGUN_API_KEY;
const domainName = "vispaduchuri.me";

const mailClient = mailgun({ apiKey: mailGunApiKey, domain: domainName });

const updateUserTimeStamp = async (userObject) => {
  const { username = "" } = userObject;

  const generateCurrentTimeStamp = new Date();

  try {
    const userDetails = await User.findOne({
      where: { username },
    });

    userDetails.verificationMailTimeStamp = generateCurrentTimeStamp;
    await userDetails.save();
    console.log("Time stamp updated successfully!");
  } catch (error) {
    console.log("Error in updating time stamp: ", error);
  }
};

// Reference taken from https://www.geeksforgeeks.org/how-to-send-email-using-mailgun-api-in-node-js/
export const sendEmailForVerification = async (userObject) => {
  const {
    username = "",
    first_name = "",
    last_name = "",
    id = "",
  } = userObject;

  const fromEmail = "Vishnu Paduchuri <postmater@vispaduchuri.me>";
  const verificationLink = `http://vispaduchuri.me:8080/v1/user/verifyUser/${id}`;

  const emailData = {
    from: fromEmail,
    to: username,
    subject: "Verification link for your account!",
    text: `Hey ${first_name} ${last_name}, Your verification links expires in 2 minutes: \n${verificationLink}\n`,
  };

  mailClient.messages().send(emailData, async (error, body) => {
    if (error) {
      console.log("Error in sending verification email", error);
    } else {
      console.log("Email sent successfully");
      await updateUserTimeStamp(userObject);
    }
  });
};

cloudEvent("sendEmailVerification", async (payload) => {
  const payloadMessage = payload.data.message.data;

  const userObject = JSON.parse(
    Buffer.from(payloadMessage, "base64").toString()
  );

  await sendEmailForVerification(userObject);
});
