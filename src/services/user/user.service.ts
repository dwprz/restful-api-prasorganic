import prismaClient from "../../applications/database";
import ResponseError from "../../error/error";
import { userValidate } from "../../validations/user.validation";
import validation from "../../validations/validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const create = async (data: any) => {
  data = validation(userValidate.register, {
    ...data,
    profile: "http://localhost:3300/images/users/profiles/default-profile.svg",
  });

  const countUser = await prismaClient.user.count({
    where: { username: data.username },
  });

  if (countUser >= 1) throw new ResponseError(400, "user already exists");

  data.password = await bcrypt.hash(data.password, 10);

  const result = await prismaClient.user.create({
    data: data,
  });

  if (result) return "success register";
};

const get = async (data: any) => {
  data = validation(userValidate.login, data);

  const user = await prismaClient.user.findUnique({
    where: { username: data.username },
  });

  if (!user) throw new ResponseError(400, "username is incorrect");

  const isCorrectPassword = await bcrypt.compare(data.password, user.password);

  if (!isCorrectPassword) {
    throw new ResponseError(400, "password is incorrect");
  }

  const payload = {
    username: user.username,
    full_name: user.full_name,
  };

  const secret = process.env.JWT_SECRET!;

  const expireJWT = 60 * 60 * 1;

  const token = jwt.sign(payload, secret, { expiresIn: expireJWT });

  return {
    data: {
      username: user.username,
      full_name: user.full_name,
      profile: user.profile,
      phone_number: user.phone_number,
    },
    token: token,
  };
};

export const userService = {
  create,
  get,
};
