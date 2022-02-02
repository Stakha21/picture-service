import type { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import { validateUserData } from "../../libs/validator";
import AWS from "aws-sdk";
import schema from "./schema";

const cognito = new AWS.CognitoIdentityServiceProvider();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const valid = validateUserData(event.body);

    if (!valid) return { error: "Invalid input data" };

    const { email, password } = event.body;
    const { user_pool_id, client_id } = process.env;

    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: user_pool_id,
      ClientId: client_id,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const response = await cognito.adminInitiateAuth(params).promise();

    if (response)
      return {
        message: "Loged in!",
        token: response.AuthenticationResult.IdToken,
      };
  } catch (err) {
    const internal = err.message ? err.message : "Internal server error!";
    return { internal };
  }
};

export const login = middyfy(handler);
