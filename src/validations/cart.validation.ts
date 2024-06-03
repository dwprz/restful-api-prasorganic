import z from "zod";

const pattern = /^[^<>/()#=|&!?:;]*$/;

const create = z.object({
  product_name: z.string().trim().max(100).min(3).regex(pattern),
  image: z.string().trim().max(250).min(3),
  quantity: z.number().min(1).max(1000).int(),
  price: z.number().max(16000000).min(1000),
  total_price: z.number().min(1000).max(20000000).int(),
  stock: z.number().max(16000000).min(1).int(),
  user_id: z.number().min(1).int(),
  product_id: z.number().min(1).max(1000000).int(),
});

export const cartValidation = {
  create,
};
