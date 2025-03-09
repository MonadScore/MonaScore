export default class BaseContract {
  public getBlockTimestamp(): Promise<number> {
    throw new Error('Not implemented');
  }
}
