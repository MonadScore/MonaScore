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
    const { user, tx } = req.body as UserRequestUpdateBody;

    if (!user || !tx) {
      res.status(400).send({ error: 'Invalid request' });
      return;
    }

    const userFromContract = await this.monaScoreContract.getUser(user.address);

    if (!userFromContract) {
      res.status(400).send({ error: 'User not found in evm' });
      return;
    }

    const existingUser = await this.dbClient.getUserByAddress(user.address);

    if (!existingUser) {
      await this.dbClient.addUser(userFromContract);

      if (userFromContract.referrer) {
        const referrerUser = await this.dbClient.getUserByReferralCode(userFromContract.referrer);

        const referrerUserFromContract = await this.monaScoreContract.getUser(referrerUser.address);
        await this.dbClient.updateUser(referrerUserFromContract);
      }
    }

    res
      .status(200)
      .send({ points: userFromContract.points, referralCode: userFromContract.referralCode });
  }

  /**
   * Handles user claim requests by verifying the transaction and updating user data.
   */
  async handleUserClaim(req: Request, res: Response) {
    const { user, tx } = req.body as UserRequestUpdateBody;

    if (!user || !tx) {
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
    const { user, tx } = req.body as UserRequestUpdateBody;

    if (!user || !tx) {
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

  // TODO: Anybody can fetch user data, mb add auth?
  /**
   * Handles user get requests by fetching user data from the database.
   */
  async handleGetUser(req: Request, res: Response) {
    const { address } = req.params as UserRequestGetParams;

    // TODO: Fetch from contract or from db?
    const user = await this.dbClient.getUserByAddress(address);

    if (!user) {
      res.status(400).send({ error: 'User not found' });
      return;
    }

    res.status(200).send(user);
  }
}
