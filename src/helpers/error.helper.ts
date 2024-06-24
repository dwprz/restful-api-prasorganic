import { DatabaseError } from "pg";
import ErrorResponse from "../errors/response.error";
import QueryError from "../errors/query.error";
import { ReplyError } from "ioredis";
import { AxiosError } from "axios";
import { HttpError } from "../errors/http.error";

export class ErrorHelper {
  static catch(name: string, error: any): ErrorResponse | QueryError | Error {
    if (error instanceof ErrorResponse) {
      return new ErrorResponse(error.status, error.message);
    }

    if (error instanceof DatabaseError || error instanceof ReplyError) {
      return new QueryError(name, error.message);
    }

    if (error instanceof AxiosError) {
      return new HttpError(
        name,
        error.response?.status || 500,
        error.response?.data
      );
    }

    return new Error(error.message || "internal server error");
  }
}
