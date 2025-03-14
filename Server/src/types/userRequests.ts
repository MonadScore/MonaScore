import { User } from './user';

/**
 * Body for the user register/claim request
 */
export type UserRequestUpdateBody = {
  user: Pick<User, 'address'> & Partial<User>;
};

/**
 * Params for the user get request
 */
export type UserRequestGetParams = {
  address: string;
};
