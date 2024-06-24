class QueryError extends Error {
  constructor(public name: string, public message: string) {
    super(message);
  }
}

export default QueryError;
