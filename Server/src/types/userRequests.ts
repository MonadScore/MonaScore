import { User } from './user';

/**
 * Body for the user register/claim request
 */
export type UserRequestUpdateBody = {
  user: Pick<User, 'address'>;
  tx: string; // transaction hash
};

/**
 * Params for the user get request
 */
export type UserRequestGetParams = {
  address: string;
};
