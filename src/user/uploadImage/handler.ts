import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
// import AWS from "aws-sdk";
import schema from "./schema";
import dotenv from "dotenv";
import { fileTypeFromBuffer } from "file-type";
// import { v4 as uuid } from "uuid";
// import mime from "mime";
import { validatePictureData } from "../../libs/validator";
const mysql = require("serverless-mysql")();

dotenv.config();

mysql.config({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
});

// const s3 = new AWS.S3();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const valid = validatePictureData(event.body);

    if (!valid) return { error: "Invalid input data" };

    let imageData = event.body.image;
    if (imageData.substring(0, 7) === "base64,")
      imageData = imageData.substring(7, imageData.length);

    const buffer = Buffer.from(imageData, "base64");
    const fileInfo = await fileTypeFromBuffer(buffer);

    // const data = await s3.createPresignedPost({
    //   Expires: 600,
    //   Bucket: process.env.imageUploadBucket,
    //   Fields: {
    //     "Content-Type": mime.getType(imageData),
    //     key: `image/${uuid()}.${ext}`,
    //     acl: "public-read",
    //   },
    //   Conditions: [["content-length-range", 100, 10000000]],
    // });

    return {
      message: fileInfo,
    };
  } catch (err) {
    const internal = err.message ? err.message : "Internal server error!";
    return { internal };
  }
};

export const uploadImage = middyfy(handler);
