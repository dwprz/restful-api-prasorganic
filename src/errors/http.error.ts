export class HttpError extends Error {
  constructor(
    public name: string,
    public status: number,
    public message: string
  ) {
    super(message);
  }
}
