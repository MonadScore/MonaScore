import { User } from '../types';
import MonaScoreAbi from './abi/MonaScore';
import BaseContract from './BaseContract';
import { ethers, JsonRpcApiProvider } from 'ethers';
import {
  convertContractToUserMessageHistory,
  convertUserToContractMessageHistory,
  executePromiseWithRetry,
} from './utils';
import BN from 'bn.js';
import { StopRetryError } from './Errors';

/**
 * Class for retrieving user score and referral information from the blockchain
 */
export default class MonaScoreContract extends BaseContract {
  private provider: JsonRpcApiProvider;

  private contractAddress: string;

  private contract: ethers.Contract;

  constructor() {
    super();
    this.provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
    this.contractAddress = process.env.MONAD_CONTRACT_PROXY_ADDRESS as string;
    this.contract = new ethers.Contract(this.contractAddress, MonaScoreAbi, this.provider);
  }

  /**
   * Gets the points balance for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's point balance
   */
  public async getPoints(address: string): Promise<number | undefined> {
    try {
      const user = await this.contract.getUser(address);
      return user && user[1];
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Gets the referral code for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's referral code
   */
  public async getReferralCode(address: string): Promise<string | undefined> {
    try {
      const user = await this.getUser(address);
      return user && user.referralCode;
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Gets the referrer address for a user
   * @param address The user's Ethereum address
   * @returns Promise resolving to the referrer's address
   */
  public async getReferrer(address: string): Promise<string | undefined> {
    try {
      const ref = await this.contract.referralToAddress(address);
      if (ref) {
        return ref;
      }

      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Gets the message history for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to array of message strings
   */
  public async getMessageHistory(address: string): Promise<string[] | undefined> {
    try {
      const user = await this.getUser(address);
      return (
        user?.messageHistory && convertUserToContractMessageHistory(user?.messageHistory.history)
      );
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Gets a user by their address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the User object
   */
  public async getUser(address: string): Promise<User | undefined> {
    const user = (await executePromiseWithRetry(
      this.contract.getUser(address).catch((error) => {
        if (['UNSUPPORTED_OPERATION', 'INVALID_ARGUMENT'].includes(error.code)) {
          throw new StopRetryError();
        }

        throw error;
      })
    ).catch(() => undefined)) as any;
    if (user && user[5]) {
      const formattedUser = {
        address: user[0],
        points: new BN(user[1]).toNumber(),
        referralCode: user[2],
        referrer: '',
        messageHistory: { history: convertContractToUserMessageHistory(user[3]) },
        lastClaim: new BN(user[4]).toNumber(),
        registered: user[5],
      };
      return formattedUser;
    }

    return undefined;
  }
}
