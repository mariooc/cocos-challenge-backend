class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class BusinessError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
