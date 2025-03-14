import bb from 'bluebird';
import { MessageHistory } from '../types';
import { StopRetryError } from './Errors';

export const executePromiseWithRetry = async <T>(
  promise: Promise<T>,
  maxTimeToResolve = 5000,
  retries = 0,
  delay = 1000
): Promise<T | undefined> => {
  if (retries >= 120) {
    throw new Error('Promise failed after retries');
  }

  try {
    const promiseResult = await new bb.Promise((resolve) => {
      resolve(promise);
    }).timeout(maxTimeToResolve);

    return promiseResult as T;
  } catch (error) {
    console.log(error);
    console.log(`Retrying #${retries} to execute promise`);

    if (error instanceof StopRetryError) {
      return undefined;
    }
  }

  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

  return executePromiseWithRetry(promise, maxTimeToResolve, retries + 1, delay);
};

export const convertContractToUserMessageHistory = (history: string[]): MessageHistory => {
  return history.map((hash) => {
    return {
      hash,
    };
  });
};

export const convertUserToContractMessageHistory = (history: MessageHistory): string[] => {
  return history.map((message) => {
    return message.hash;
  });
};
