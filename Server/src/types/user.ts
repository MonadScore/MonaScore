/**
 * Message history type
 */
export type MessageHistory = {
  hash: string;
  message?: string;
  timestamp?: number;
}[];

/**
 * User type
 */
export type User = {
  address: string; // address of the user
  points: number; // number of points
  referralCode: string; // referral code
  referrer?: string; // referrer code
  messageHistory: { history: MessageHistory }; // history of message by map hash
  lastClaim: number; // timestamp of the last daily claim
  registered: boolean; // registration status
};
