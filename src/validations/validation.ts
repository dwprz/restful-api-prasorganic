import { ZodType } from "zod";
import ResponseError from "../error/response.error";

function validation<T>(schema: ZodType, data: T): T {
  const res = schema.safeParse(data);
  if (res.success) {
    return res.data;
  } else {
    console.log("validation error:" + res.error.message);
    throw new ResponseError(400, "bad request");
  }
}

export default validation;
