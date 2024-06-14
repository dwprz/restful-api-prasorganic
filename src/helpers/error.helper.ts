import { DatabaseError } from "pg";
import ErrorResponse from "../error/response.error";
import QueryError from "../error/query.error";
import { ReplyError } from "ioredis";

export class ErrorHelper {
  static catch(name: string, error: any): ErrorResponse | QueryError | Error {
    if (error instanceof ErrorResponse) {
      return new ErrorResponse(error.status, error.message);
    }

    if (error instanceof DatabaseError || error instanceof ReplyError) {
      return new QueryError(name, error.message);
    }

    return new Error(error.message || "internal server error");
  }
}
