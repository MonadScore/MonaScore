export type MessageHistory = string;

export type User = {
  address: string; // address of the user
  points: number; // number of points
  referralCode: string; // referral code
  referrer: string; // referrer code
  messageHistory: MessageHistory[]; // history of message hashes
  lastClaim: number; // timestamp of the last daily claim
  registered: boolean; // registration status
};
