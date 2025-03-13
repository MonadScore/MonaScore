import { User } from '../types';
import pool from 'db';
/**
 * Database client for interacting with the database
 */
export default class DBClient {
  /**
   * Retrieves a user by their address
   * @param address The user's address
   * @returns Promise resolving to the User object
   */
  public getUserByAddress(address: string): Promise<User> {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT address,points,referral_code,referer,last_claim,registered FROM users WHERE address = $1', [address]);
      return rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Updates an existing user's information
   * @param updatedUser The updated User object
   * @returns Promise resolving to the updated User
   */
  public updateUser(updatedUser: User): Promise<User> {
    throw new Error('Not implemented');
  }

  /**
   * Adds a new user to the database
   * @param user The User object to add
   * @returns Promise resolving to the created User
   */
  public addUser(user: User): Promise<User> {
    throw new Error('Not implemented');
  }

  /**
   * Adds a message to a user's message history
   * @param address The user's address
   * @param message The message to add
   * @returns Promise resolving when message is added
   */
  public addMessage(address: string, message: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Gets all messages for a user
   * @param address The user's address
   * @returns Promise resolving to array of message strings
   */
  public getMessages(address: string): Promise<string[]> {
    throw new Error('Not implemented');
  }

  /**
   * Finds a user by their referral code
   * @param referralCode The referral code to search for
   * @returns Promise resolving to the matching User
   */
  public getUserByReferralCode(referralCode: string): Promise<User> {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT address FROM users WHERE referral_code = $1', [referralCode]);
      return rows[0];
    } finally {
      client.release();
    }
  }
}
