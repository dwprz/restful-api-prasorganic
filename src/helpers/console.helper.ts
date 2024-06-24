import { ZodError } from "zod";
import { DateHelper } from "./date.helper";
import { AxiosError } from "axios";

export class ConsoleHelper {
  static log(data: any) {
    const log = {
      timestamp: DateHelper.newLocalDate(),
      log: data,
    };

    console.log(JSON.stringify(log, null, 2));
  }

  static error(name: string | undefined, erorr: any) {
    let message = erorr?.message || "internal server error";

    if (erorr instanceof ZodError) {
      message = JSON.parse(erorr?.message);
    }

    if (erorr instanceof AxiosError) {
      message = erorr.response?.data;
    }

    const log = {
      timestamp: DateHelper.newLocalDate(),
      name: name,
      error: message,
    };

    console.log(JSON.stringify(log, null, 2));
  }
}
