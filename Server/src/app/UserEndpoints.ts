import { BodyParser } from 'body-parser';
import { Express, Request, Response } from 'express';
import { accountEndpointsDefinitions } from './definitions/accountEndpointsDefinition';
import UserRequestHandler from './UserRequestHandler';

export default function UserEndpoints(
  app: Express,
  bodyParser: BodyParser,
  userHandler: UserRequestHandler
) {
  app.post(
    accountEndpointsDefinitions.userRegister.path,
    bodyParser.json(),
    async (req: Request, res: Response) => {
      await userHandler.handleUserRegister(req, res);
    }
  );

  app.post(
    accountEndpointsDefinitions.userClaim.path,
    bodyParser.json(),
    async (req: Request, res: Response) => {
      await userHandler.handleUserClaim(req, res);
    }
  );

  app.post(
    accountEndpointsDefinitions.userMessage.path,
    bodyParser.json(),
    async (req: Request, res: Response) => {
      await userHandler.handleUserMessage(req, res);
    }
  );

  app.get(accountEndpointsDefinitions.userData.path, async (req: Request, res: Response) => {
    await userHandler.handleGetUser(req, res);
  });
}
