import { User } from '../types';
import BaseContract from './BaseContract';

/**
 * Class for retrieving user score and referral information from the blockchain
 */
export default class MonaScoreContract extends BaseContract {
  /**
   * Gets the points balance for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's point balance
   */
  public async getPoints(address: string): Promise<number> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the referral code for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's referral code
   */
  public async getReferralCode(address: string): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the referrer address for a user
   * @param address The user's Ethereum address
   * @returns Promise resolving to the referrer's address
   */
  public async getReferrer(address: string): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the message history for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to array of message strings
   */
  public async getMessageHistory(address: string): Promise<string[]> {
    throw new Error('Not implemented');
  }

  public async getUser(address: string): Promise<User> {
    throw new Error('Not implemented');
  }

  /**
   * Verifies a transaction
   * @param address The user's Ethereum address
   * @param txHash The transaction hash
   * @returns Promise resolving to true if the transaction is valid, false otherwise
   */
  public async verifyTx(address: string, txHash: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
