import { User } from '../types';
import BaseContract from './BaseContract';
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
const abi = [{"inputs":[],"name":"ContractAreNotAllowed","type":"error"},{"inputs":[],"name":"DailyClaimAlreadyTaken","type":"error"},{"inputs":[],"name":"InvalidReferralCode","type":"error"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"length","type":"uint256"}],"name":"StringsInsufficientHexLength","type":"error"},{"inputs":[],"name":"UserAlreadyRegistered","type":"error"},{"inputs":[],"name":"UserNotRegistered","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"points","type":"uint256"}],"name":"PointsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"referralCode","type":"string"}],"name":"Registered","type":"event"},{"inputs":[],"name":"claimPoints","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUser","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"bytes32[]","name":"","type":"bytes32[]"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"referralCode","type":"string"}],"name":"referralToAddress","outputs":[{"internalType":"address","name":"userAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_referralCode","type":"string"}],"name":"register","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_message","type":"string"}],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint256","name":"points","type":"uint256"},{"internalType":"string","name":"referralCode","type":"string"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"bool","name":"registered","type":"bool"}],"stateMutability":"view","type":"function"}];
const cAddress = "0x8f8b4eb5329B3261cAe7E4cb7D066F84b67C6252";
const contract = new ethers.Contract(cAddress, abi, provider);

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
    try {
      const user = await contract.getUser(address);
      if(user[5]){
        return user[1];
      }else{
        return false;
      }
    }catch(err) {
      return false;
    }
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
    try {
      const ref = await contract.referralToAddress(address);
      if(ref){
	    return ref;
	  }else{
	    return false;
	  }
    }catch(err) {
      return false;
    }
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
    try {
      const user = await contract.getUser(address);
      if(user[5]){
        const User = {
          address: user[0],
          points: user[1], 
          referralCode: user[2],
          referrer: '', 
          messageHistory: [''], 
          lastClaim: user[4], 
          registered: user[5] 
        };
        return User;
      }else{
        return false;
      }
    }catch(err) {
      return false;
    }
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
