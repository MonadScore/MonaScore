import { User } from './user';

/**
 * Body for the user register/claim endpoint
 */
export type UserRequestUpdateBody = {
  user: User;
  tx: string; // transaction hash
};

/**
 * Params for the user get endpoint
 */
export type UserRequestGetParams = {
  address: string;
};
