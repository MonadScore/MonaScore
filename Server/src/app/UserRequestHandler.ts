import { Request, Response } from 'express';
import DBClient from '../database/DBClient';
import { User } from '../types';
import MonaScoreContract from '../evm/MonaScoreContract';
import { UserRequestUpdateBody, UserRequestGetParams } from '../types/userRequests';

/**
 * Handles user requests
 */
export default class UserRequestHandler {
  private readonly dbClient: DBClient;

  private readonly monaScoreContract: MonaScoreContract;

  constructor(dbClient: DBClient, monaScoreContract: MonaScoreContract) {
    this.dbClient = dbClient;
    this.monaScoreContract = monaScoreContract;
  }

  /**
   * Handles user registration by processing the request and response.
   */
  async handleUserRegister(req: Request, res: Response) {
    const { user } = req.body as UserRequestUpdateBody;

    if (!user) {
      res.status(400).send({ error: 'Invalid request' });
      return;
    }

    const existingUser = await this.dbClient.getUserByAddress(user.address);

    let userToReturn;
    if (!existingUser) {
      const userFromContract = await this.monaScoreContract.getUser(user.address);

      if (!userFromContract) {
        res.status(400).send({ error: 'User not found in evm' });
        return;
      }

      userToReturn = { ...userFromContract, messageHistory: { history: [] } };

      await this.dbClient.addUser({ ...userFromContract, messageHistory: { history: [] } });

      if (user.referrer) {
        const referrerUserFromContract = await this.monaScoreContract
          .getUser(user.referrer)
          .catch(() => undefined);

        if (!referrerUserFromContract) {
          const referrerUser = await this.dbClient.getUserByReferralCode(user.referrer);

          referrerUser &&
            (await this.dbClient.updateUser({
              ...referrerUser,
              points: referrerUser.points + 1,
            }));
        } else {
          await this.dbClient.updateUser(referrerUserFromContract);
        }
      }
    } else {
      userToReturn = existingUser;
    }

    res.status(200).send({ points: userToReturn.points, referralCode: userToReturn.referralCode });
  }

  /**
   * Handles user claim requests by verifying the transaction and updating user data.
   */
  async handleUserClaim(req: Request, res: Response) {
    const { user } = req.body as UserRequestUpdateBody;

    if (!user) {
      res.status(400).send({ error: 'Invalid request' });
      return;
    }

    const userFromContract = await this.monaScoreContract.getUser(user.address);

    if (!userFromContract) {
      res.status(400).send({ error: 'User not found in evm' });
      return;
    }

    await this.dbClient.updateUser(userFromContract);

    res
      .status(200)
      .send({ points: userFromContract.points, referralCode: userFromContract.referralCode });
  }

  /**
   * Handles user message requests by verifying the transaction and updating user data.
   */
  async handleUserMessage(req: Request, res: Response) {
    const { user } = req.body as UserRequestUpdateBody;

    if (!user) {
      res.status(400).send({ error: 'Invalid request' });
      return;
    }

    const userFromContract = await this.monaScoreContract.getUser(user.address);

    if (!userFromContract) {
      res.status(400).send({ error: 'User not found in evm' });
      return;
    }

    await this.dbClient.updateUser(userFromContract);

    res
      .status(200)
      .send({ points: userFromContract.points, referralCode: userFromContract.referralCode });
  }

  /**
   * Handles user get requests by fetching user data from the database.
   */
  async handleGetUser(req: Request, res: Response) {
    const { address } = req.query as UserRequestGetParams;

    const user = await this.dbClient.getUserByAddress(address);

    if (!user) {
      res.status(400).send({ error: 'User not found' });
      return;
    }

    res.status(200).send(user);
  }
}
