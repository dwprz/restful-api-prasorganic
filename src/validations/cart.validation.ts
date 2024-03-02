import Joi from "joi";

const pattern = /^[^<>/()#=|&!?:;]*$/;

const create = Joi.object({
  name: Joi.string().trim().max(100).min(3).pattern(pattern).required(),
  username: Joi.string().trim().max(100).min(4).pattern(pattern).required(),
  image: Joi.string().trim().max(250).min(3).required(),
  product_id: Joi.number().required(),
  stock: Joi.number().max(16000000).min(1).integer().required(),
  order_id: Joi.number().optional(),
});

export const cartValidate = {
  create,
};
