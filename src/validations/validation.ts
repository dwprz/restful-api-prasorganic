import ResponseError from "../error/error";

const validation = (schema: any, request: any) => {
  const { error, value } = schema.validate(request, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) throw new ResponseError(400, error.message);

  return value;
};

export default validation;
