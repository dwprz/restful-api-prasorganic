import Joi from "joi";

const pattern = /^[^<>/()#=|&!?:;]*$/;

const register = Joi.object({
  username: Joi.string().trim().max(100).min(4).pattern(pattern).required(),
  full_name: Joi.string().trim().max(100).min(4).pattern(pattern).required(),
  profile: Joi.string().trim().max(100).required(),
  phone_number: Joi.string().max(20).pattern(pattern).optional(),
  email: Joi.string().max(100).min(8).pattern(pattern).optional(),
  password: Joi.string().trim().max(100).min(5).pattern(pattern).required(),
});

const login = Joi.object({
  username: Joi.string().trim().max(100).min(4).pattern(pattern).required(),
  password: Joi.string().trim().max(100).min(5).pattern(pattern).required(),
});

// const loginWithGoogle = Joi.object({

// })

export const userValidate = {
  register,
  login,
};
