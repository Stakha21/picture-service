import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import schema from "./schema";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
});

console.log(connection);

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed: " + err.stack);
    return;
  }

  console.log("Connected to database.");
});

connection.end();
const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  _
) => {
  return {
    message: "Good",
  };
};

export const privateAPI = middyfy(handler);
