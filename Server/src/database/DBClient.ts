import { Pool } from 'pg';
import { User } from '../types';
/**
 * Database client for interacting with the database
 */
export default class DBClient {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });
  }

  private dbRowToUser(row: any): User | undefined {
    return row
      ? {
          address: row.address,
          points: row.points,
          referralCode: row.referral_code,
          referrer: row.referrer,
          lastClaim: row.last_claim,
          registered: row.registered,
          messageHistory: row.message_history,
        }
      : undefined;
  }

  /**
   * Retrieves a user by their address
   * @param address The user's address
   * @returns Promise resolving to the User object
   */
  public async getUserByAddress(address: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const { rows } = await this.pool.query(
        'SELECT address, points, referral_code, referrer, last_claim, registered, message_history FROM users WHERE address = $1',
        [address]
      );
      return this.dbRowToUser(rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Updates an existing user's information
   * @param updatedUser The updated User object
   * @returns Promise resolving to the updated User
   */
  public async updateUser(updatedUser: User): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const { rows } = await this.pool.query(
        'UPDATE users SET points = $1, referral_code = $2, referrer = $3, last_claim = $4, registered = $5, message_history = $6 WHERE address = $7 RETURNING *',
        [
          updatedUser.points,
          updatedUser.referralCode,
          updatedUser.referrer,
          updatedUser.lastClaim,
          updatedUser.registered,
          updatedUser.messageHistory,
          updatedUser.address,
        ]
      );
      return this.dbRowToUser(rows[0]);
    } catch (error) {
      console.error(error);
      return undefined;
    } finally {
      client.release();
    }
  }

  /**
   * Adds a new user to the database
   * @param user The User object to add
   * @returns Promise resolving to the created User
   */
  public async addUser(user: User): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const { rows } = await this.pool.query(
        'INSERT INTO users (address, points, referral_code, referrer, last_claim, registered, message_history) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          user.address,
          user.points,
          user.referralCode,
          user.referrer,
          user.lastClaim,
          user.registered,
          user.messageHistory,
        ]
      );
      return this.dbRowToUser(rows[0]);
    } catch (error) {
      console.error(error);
      return undefined;
    } finally {
      client.release();
    }
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
  public async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT address FROM users WHERE referral_code = $1', [
        referralCode,
      ]);
      return this.dbRowToUser(rows[0]);
    } catch (error) {
      console.error(error);
      return undefined;
    } finally {
      client.release();
    }
  }
}
