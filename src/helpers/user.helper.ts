import { User } from "../interfaces/user.interface";

export class UserHelper {
  static sanitize(users: User[]) {
    if (!users.length) {
      return [];
    }

    const result = users.map((user) => {
      const { password, refresh_token, ...rest } = user;
      return rest;
    });

    return result;
  }
}
