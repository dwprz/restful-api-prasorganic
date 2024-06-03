export class RequestHelper {
  static parse(request: Record<string, any>) {
    let result = {} as any;

    for (let key in request) {
      !Number.isNaN(Number(request[key]))
        ? (result[key] = Number(request[key]))
        : (result[key] = request[key]);
    }

    return result;
  }
}
