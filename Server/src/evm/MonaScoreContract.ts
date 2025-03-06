/**
 * Class for retrieving user score and referral information from the blockchain
 */
export default class MonaScore {
  /**
   * Gets the points balance for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's point balance
   */
  public static async getPoints(address: string): Promise<number> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the referral code for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to the user's referral code
   */
  public static async getReferralCode(address: string): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the referrer address for a user
   * @param address The user's Ethereum address
   * @returns Promise resolving to the referrer's address
   */
  public static async getReferrer(address: string): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Gets the message history for a user address
   * @param address The user's Ethereum address
   * @returns Promise resolving to array of message strings
   */
  public static async getMessageHistory(address: string): Promise<string[]> {
    throw new Error('Not implemented');
  }
}
