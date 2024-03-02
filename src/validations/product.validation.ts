import Joi from "joi";

const pattern = /^[^<>/()#=|&!?:;]*$/;

const create = Joi.object({
  name: Joi.string().trim().max(100).min(3).pattern(pattern).required(),
  image: Joi.string().trim().max(250).min(3).required(),
  category: Joi.string().trim().max(20).min(3).required(),
  rate: Joi.number().max(5).min(1).optional(),
  sold: Joi.number().max(16000000).min(1).integer().optional(),
  initial_price: Joi.number().max(16000000).min(1000).integer().required(),
  stock: Joi.number().max(16000000).min(1).integer().required(),
  description: Joi.string().trim().max(300).min(5).pattern(pattern).optional(),
  tags: Joi.array()
    .items(Joi.string().alphanum().min(3).max(30))
    .max(3)
    .required(),
});

const get = Joi.object({
  page: Joi.number().min(1).max(20).positive().integer().default(1),
  category: Joi.string().trim().max(10).pattern(pattern).optional(),
  search: Joi.alternatives(
    Joi.array().items(Joi.string().alphanum().min(3).max(30)).max(3),
    Joi.string().alphanum().min(3).max(30)
  ).optional(),
});

const update = Joi.object({
  name: Joi.string().trim().max(100).min(3).pattern(pattern).optional(),
  image: Joi.string().trim().max(100).min(3).optional(),
  rate: Joi.number().max(5).min(1).optional(),
  sold: Joi.number().max(16000000).min(1).integer().optional(),
  initial_price: Joi.number().max(16000000).min(1000).integer().optional(),
  stock: Joi.number().max(16000000).min(1).integer().optional(),
  description: Joi.string().trim().max(300).min(5).pattern(pattern).optional(),
});

export const productValidate = {
  create,
  update,
  get,
};
