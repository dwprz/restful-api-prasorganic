import ErrorResponse from "../errors/response.error";
import { AuthHelper } from "../helpers/auth.helper";
import { EnvHelper } from "../helpers/env.helper";
import { TemplateHelper } from "../helpers/template.helper";
import { TransporterHelper } from "../helpers/transporter.helper";
import { OTP } from "../interfaces/otp.interface";
import {
  UserAutnenticate,
  UserLogin,
  UserLoginWithGoogle,
  UserRegister,
} from "../interfaces/user.interface";
import { OtpModelModify } from "../models/otp/modify.model";
import { OtpModelRetrieve } from "../models/otp/retrieve.model";
import { UserModelModify } from "../models/user/modify.model";
import { UserModelRetrieve } from "../models/user/retrieve.model";
import { AuthValidation } from "../validations/schema/auth.validation";
import validation from "../validations/validation";
import bcrypt from "bcrypt";
import "dotenv/config";

export class AuthService {
  static async sendOtp(email: string) {
    email = validation(AuthValidation.email, email);

    const otp = AuthHelper.generateOtp();
    const GMAIL_MASTER = process.env.GMAIL_MASTER;

    EnvHelper.validate({ GMAIL_MASTER });

    const template = TemplateHelper.render(
      process.cwd() + "/template/otp.html",
      { otp }
    );

    const subject = "Verifycation With Otp";

    await TransporterHelper.sendMail(GMAIL_MASTER!, email, subject, template);

    await OtpModelModify.upsertByEmail(email, otp);
  }

  static async verifyOtp(data: OTP) {
    data = validation(AuthValidation.otp, data);

    const existing_otp = await OtpModelRetrieve.findByEmail(data.email);
    AuthHelper.verifyOtp(data.otp, existing_otp!.otp);

    await OtpModelModify.deleteByEmail(data.email);
  }

  static async register(data: UserRegister) {
    data = validation(AuthValidation.register, data);

    const encrypt_password = await bcrypt.hash(data.password, 10);

    const user = await UserModelModify.create({
      ...data,
      password: encrypt_password,
    });

    return user;
  }

  static async login(data: UserLogin) {
    data = validation(AuthValidation.authenticate, data);

    const existing_user = await UserModelRetrieve.findByFields({
      email: data.email,
    });

    if (!existing_user) {
      throw new ErrorResponse(404, "user not found");
    }

    await AuthHelper.comparePassword(data.password, existing_user.password);

    const new_access_token = AuthHelper.createAccessToken(existing_user);
    const new_refresh_token = AuthHelper.createRefreshToken();

    const user = await UserModelModify.updateByEmail(
      { refresh_token: new_refresh_token },
      data.email
    );

    return {
      user,
      tokens: {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      },
    };
  }

  static async loginWithGoogle(data: UserLoginWithGoogle) {
    const { email } = validation(AuthValidation.loginWithGoogle, data);

    const result = await UserModelModify.upsertByEmail(data);

    const new_access_token = AuthHelper.createAccessToken(result);
    const new_refresh_token = AuthHelper.createRefreshToken();

    const user = await UserModelModify.updateByEmail(
      { refresh_token: new_refresh_token },
      email
    );

    return {
      user,
      tokens: {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      },
    };
  }

  static async generateNewAccessToken(refresh_token: string) {
    const existing_user = await UserModelRetrieve.findByFields({
      refresh_token,
    });

    if (!existing_user) {
      throw new ErrorResponse(401, "no user matches the refresh token.");
    }

    const access_token = AuthHelper.createAccessToken(existing_user);
    const { password, refresh_token: rt, ...user } = existing_user;

    return { access_token, user };
  }

  static async clearRefreshToken(email: string) {
    await UserModelModify.updateByEmail({ refresh_token: null }, email);
  }

  static async authenticate(data: UserAutnenticate) {
    const { email, password } = validation(AuthValidation.authenticate, data);

    const existing_user = await UserModelRetrieve.findByFields({ email });

    if (!existing_user!.password) {
      throw new ErrorResponse(400, "the user does not have a password");
    }

    await AuthHelper.comparePassword(password, existing_user!.password);
  }
}
