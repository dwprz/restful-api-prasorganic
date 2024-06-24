import ErrorResponse from "../errors/response.error";
import { AuthHelper } from "../helpers/auth.helper";
import { FileHelper } from "../helpers/file.helper";
import { PagingHelper } from "../helpers/paging.helper";
import { UserHelper } from "../helpers/user.helper";
import {
  UsersByFullName,
  UsersByRole,
  UserUpdateEmail,
  UserUpdatePassword,
  UserUpdatePhotoProfile,
  UserUpdateProfile,
} from "../interfaces/user.interface";
import { UserUtil } from "../utils/user.util";
import { UserValidation } from "../validations/schema/user.validation";
import validation from "../validations/validation";
import { AuthService } from "./auth.service";
import bcrypt from "bcrypt";

export class UserService {
  static async getByEmail(email: string) {
    email = validation(UserValidation.email, email);

    const { password, refresh_token, ...user } = await UserUtil.findByFields({
      email,
    });

    return user;
  }

  static async getByRole(data: UsersByRole) {
    const { page, role } = validation(UserValidation.getByRole, data);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const existing_users = await UserUtil.findManyByFields(
      { role },
      limit,
      offset
    );

    const users = UserHelper.transform(existing_users);
    const total_users = await UserUtil.countByFields({ role });

    const result = PagingHelper.formatPagedData(
      users,
      total_users,
      page,
      limit
    );

    return result;
  }

  static async getByFullName(data: UsersByFullName) {
    const { full_name, role, page } = validation(
      UserValidation.getByFullName,
      data
    );

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const existing_users = await UserUtil.findManyByFields(
      { full_name, role },
      limit,
      offset
    );

    const users = UserHelper.transform(existing_users);
    const total_users = await UserUtil.countByFields({
      role,
      full_name,
    });

    const result = PagingHelper.formatPagedData(
      users,
      total_users,
      page,
      limit
    );

    return result;
  }

  static async updateProfile(data: UserUpdateProfile) {
    const { password, ...updateData } = validation(
      UserValidation.updateProfile,
      data
    );

    const existing_user = await UserUtil.findByFields({ email: data.email });

    if (!existing_user.password) {
      throw new ErrorResponse(400, "the user does not have a password");
    }

    await AuthHelper.comparePassword(password, existing_user.password);

    const user = await UserUtil.updateByEmail(updateData, data.email);

    return user;
  }

  static async updatePhotoProfile(data: UserUpdatePhotoProfile) {
    const { email, photo_profile, new_photo_profile } = validation(
      UserValidation.updatePhotoProfile,
      data
    );

    if (photo_profile) {
      FileHelper.deleteByUrl(photo_profile);
    }

    const user = await UserUtil.updateByEmail(
      { photo_profile: new_photo_profile },
      email
    );

    return user;
  }

  static async updatePassword(data: UserUpdatePassword) {
    let { email, password, new_password } = validation(
      UserValidation.updatePassword,
      data
    );

    const existing_user = await UserUtil.findByFields({ email });

    if (!existing_user.password) {
      throw new ErrorResponse(400, "the user does not have a password");
    }

    await AuthHelper.comparePassword(password, existing_user.password);

    new_password = await bcrypt.hash(new_password, 10);

    await UserUtil.updateByEmail({ password: new_password }, email);
  }

  static async updateEmail(data: UserUpdateEmail) {
    const { email, new_email, otp } = validation(
      UserValidation.updateEmail,
      data
    );

    const existing_user = await UserUtil.findByFields({ email });

    await AuthService.verifyOtp({ email: new_email, otp: otp });

    const user = await UserUtil.updateByEmail({ email: new_email }, email);

    const access_token = AuthHelper.createAccessToken({
      ...existing_user,
      email: new_email,
    });

    return { user, access_token };
  }
}
