import { User } from '../types';
import pool from './db';
/**
 * Database client for interacting with the database
 */
export default class DBClient {
  /**
   * Retrieves a user by their address
   * @param address The user's address
   * @returns Promise resolving to the User object
   */
  public async getUserByAddress(address: string): Promise<User> {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT address,points,referral_code,referrer,last_claim,registered FROM users WHERE address = $1', [address]);
      if(rows && rows.length > 0){
        const result = {
          address: rows[0].address,
          points: rows[0].points, 
          referralCode: rows[0].referral_code,
          referrer: '', 
          messageHistory: [''], 
          lastClaim: rows[0].last_claim, 
          registered: rows[0].registered 
        };
        return result;
      }else{
	    throw new Error('error');
	  }
    } finally {
      client.release();
    }
  }

  /**
   * Updates an existing user's information
   * @param updatedUser The updated User object
   * @returns Promise resolving to the updated User
   */
  public async updateUser(updatedUser: User): Promise<User> {
    const client = await pool.connect();
    try {
      let data = Array();
      data.push(updatedUser.points);
      data.push(new Date(String(updatedUser.lastClaim*1000)));
      data.push(updatedUser.address);
      const { rows } = await client.query("UPDATE users SET (points, last_claim) = ($1, $2) WHERE address = $3 RETURNING *", data);
      if(rows && rows.length > 0){
        const result = {
          address: rows[0].address,
          points: rows[0].points, 
          referralCode: rows[0].referral_code,
          referrer: '', 
          messageHistory: [''], 
          lastClaim: rows[0].last_claim, 
          registered: rows[0].registered 
        };
        return result;
      }else{
	    throw new Error('error');
	  }
    } finally {
      client.release();
    }
  }

  /**
   * Adds a new user to the database
   * @param user The User object to add
   * @returns Promise resolving to the created User
   */
  public async addUser(user: User): Promise<User> {
    const client = await pool.connect();
    try {
      let data = Array();
        data.push(user.address);
      data.push(user.points);
      data.push(user.referralCode);
	  data.push(true);
	  data.push('0x0');
      data.push(new Date(String(user.lastClaim*1000)));
	  const { rows } = await client.query("INSERT INTO users (address, points, referral_code,  last_claim, registered, referrer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", data);
      if(rows && rows.length > 0){
        const result = {
          address: rows[0].address,
          points: rows[0].points, 
          referralCode: rows[0].referral_code,
          referrer: '', 
          messageHistory: [''], 
          lastClaim: rows[0].last_claim, 
          registered: rows[0].registered 
        };
        return result;
      }else{
	    throw new Error('error');
	  }
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
  public async getUserByReferralCode(referralCode: string): Promise<User> {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT address,points,referral_code,referrer,last_claim,registered FROM users WHERE referral_code = $1', [referralCode]);
      if(rows && rows.length > 0){
        const result = {
          address: rows[0].address,
          points: rows[0].points, 
          referralCode: rows[0].referral_code,
          referrer: '', 
          messageHistory: [''], 
          lastClaim: rows[0].last_claim, 
          registered: rows[0].registered 
        };
        return result;
      }else{
	    throw new Error('error');
	  }
    } finally {
      client.release();
    }
  }
}
