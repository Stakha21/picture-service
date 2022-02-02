import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import { validateUserData } from "../../libs/validator";
import AWS from "aws-sdk";
import schema from "./schema";
import dotenv from "dotenv";
const mysql = require("serverless-mysql")();

dotenv.config();

mysql.config({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
});

const cognito = new AWS.CognitoIdentityServiceProvider();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const valid = validateUserData(event.body);

    if (!valid) return { error: "Invalid input data" };

    const { email, password } = event.body;
    const { user_pool_id } = process.env;

    const params = {
      UserPoolId: user_pool_id,
      Username: email,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
      ],
      MessageAction: "SUPPRESS",
    };
    const response = await cognito.adminCreateUser(params).promise();

    if (response.User) {
      const paramsForSetPass = {
        Password: password,
        UserPoolId: user_pool_id,
        Username: email,
        Permanent: true,
      };
      await cognito.adminSetUserPassword(paramsForSetPass).promise();
    }

    const tables = await mysql.query("SHOW TABLES");
    if (!(tables.length > 0)) {
      await mysql.query(
        "CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(50))"
      );
      await mysql.query(`INSERT INTO users (email) VALUES ('${email}')`);
    } else await mysql.query(`INSERT INTO users (email) VALUES ('${email}')`);

    await mysql.end();

    return {
      message: "User registration successful",
    };
  } catch (err) {
    const internal = err.message ? err.message : "Internal server error!";
    return { internal };
  }
};

export const signup = middyfy(handler);
