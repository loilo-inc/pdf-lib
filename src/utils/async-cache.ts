export class AsyncCache<T> {
  private readonly populate: () => Promise<T>;
  private promise: Promise<T> | undefined;
  private value: T | undefined;

  constructor(populate: () => Promise<T>) {
    this.populate = populate;
    this.value = undefined;
    this.promise = undefined;
  }

  getValue(): T | undefined {
    return this.value;
  }

  async access(): Promise<T> {
    if (this.value !== undefined) {
      return this.value;
    } else if (this.promise) {
      return this.promise;
    }
    this.promise = this.populate();
    this.value = await this.promise;
    return this.value;
  }

  invalidate(): void {
    this.value = undefined;
    this.promise = undefined;
  }
}
