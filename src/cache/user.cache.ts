import redis from "../apps/redis.app";
import { ErrorHelper } from "../helpers/error.helper";
import { UserSanitized } from "../interfaces/user.interface";

export class UserCache {
  static async cache(data: UserSanitized) {
    try {
      if (!data) return;

      const key = `user_id:${data.user_id}`;

      await redis.setex(key, 3600 * 24 * 7, JSON.stringify(data));
    } catch (error) {
      throw ErrorHelper.catch("cache user", error);
    }
  }

  static async findById(user_id: number) {
    try {
      const user = await redis.get(`user_id:${user_id}`);

      if (!user) {
        return null;
      }

      return JSON.parse(user) as UserSanitized;
    } catch (error) {
      throw ErrorHelper.catch("find user cache", error);
    }
  }
}
