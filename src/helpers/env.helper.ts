import ErrorResponse from "../errors/response.error";

export class EnvHelper {
  static validate(environments: Record<string, string | undefined>) {
    for (let env in environments) {
      if (!environments[env]) {
        throw new ErrorResponse(422, `${env} env is not provided`);
      }
    }
  }
}
