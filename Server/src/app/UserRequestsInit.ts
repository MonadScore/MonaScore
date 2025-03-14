import { BodyParser } from 'body-parser';
import { Express, Request, Response } from 'express';
import { userRequestsDefinitions } from './definitions/userRequestsDefinition';
import UserRequestHandler from './UserRequestHandler';

export default function UserRequestsInit(
  app: Express,
  bodyParser: BodyParser,
  userHandler: UserRequestHandler
) {
  const jsonBodyParser = bodyParser.json();

  app.post(
    userRequestsDefinitions.userRegister.path,
    jsonBodyParser,
    async (req: Request, res: Response) => {
      await userHandler.handleUserRegister(req, res);
    }
  );

  app.post(
    userRequestsDefinitions.userClaim.path,
    jsonBodyParser,
    async (req: Request, res: Response) => {
      await userHandler.handleUserClaim(req, res);
    }
  );

  app.post(
    userRequestsDefinitions.userMessage.path,
    jsonBodyParser,
    async (req: Request, res: Response) => {
      await userHandler.handleUserMessage(req, res);
    }
  );

  app.get(userRequestsDefinitions.userData.path, async (req: Request, res: Response) => {
    await userHandler.handleGetUser(req, res);
  });
}
