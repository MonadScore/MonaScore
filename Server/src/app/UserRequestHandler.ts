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

    const isTxValid = await this.monaScoreContract.verifyTx(user.address, tx);

    if (!isTxValid) {
      res.status(400).send({ error: 'Invalid transaction' });
      return;
    }

    const existingUser = await this.dbClient.getUserByAddress(user.address);

    let userFromDB: User;

    if (!existingUser) {
      userFromDB = await this.dbClient.addUser(user);
    } else {
      userFromDB = existingUser;

      if (existingUser.referrer) {
        const referrerUser = await this.dbClient.getUserByReferralCode(existingUser.referrer);

        // TODO: fetch referred user updated data from contract or not?
        if (referrerUser) {
          referrerUser.points += 1;
          await this.dbClient.updateUser(referrerUser);
        }
      }
    }

    if (user.referrer) {
      const referrerUser = await this.dbClient.getUserByReferralCode(user.referrer);

      if (referrerUser) {
        referrerUser.points += 1;
        await this.dbClient.updateUser(referrerUser);
      }
    }

    res.status(200).send({ points: userFromDB.points, referralCode: userFromDB.referralCode });
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

    const isTxValid = await this.monaScoreContract.verifyTx(user.address, tx);

    if (!isTxValid) {
      res.status(400).send({ error: 'Invalid transaction' });
      return;
    }

    const userFromDB = await this.dbClient.getUserByAddress(user.address);

    if (!userFromDB) {
      res.status(400).send({ error: 'User not found' });
      return;
    }

    await this.dbClient.updateUser(user);

    res.status(200).send({ points: userFromDB.points, referralCode: userFromDB.referralCode });
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

    const isTxValid = await this.monaScoreContract.verifyTx(user.address, tx);

    if (!isTxValid) {
      res.status(400).send({ error: 'Invalid transaction' });
      return;
    }

    await this.dbClient.updateUser(user);

    res.status(200).send({ points: user.points, referralCode: user.referralCode });
  }

  // TODO: Anybody can fetch user data, mb add auth?
  /**
   * Handles user get requests by fetching user data from the database.
   */
  async handleGetUser(req: Request, res: Response) {
    const { address } = req.params as UserRequestGetParams;

    const user = await this.dbClient.getUserByAddress(address);

    if (!user) {
      res.status(400).send({ error: 'User not found' });
      return;
    }

    res.status(200).send(user);
  }
}
