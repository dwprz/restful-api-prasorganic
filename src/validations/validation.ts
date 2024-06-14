import { ZodType } from "zod";

function validation<T>(schema: ZodType, data: T): T {
  const result = schema.parse(data);
  return result;
}

export default validation;
