import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import { validator } from "../../libs/validator";
import AWS from "aws-sdk";
import schema from "./schema";

const cognito = new AWS.CognitoIdentityServiceProvider();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const valid = validator(event.body);

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
    return {
      message: "User registration successful",
    };
  } catch (err) {
    const internal = err.message ? err.message : "Internal server error!";
    return { internal };
  }
};

export const signup = middyfy(handler);
