import z from "zod";

const pattern = /^[^<>/()#=|&!?:;]*$/;

const create = z.object({
  address_owner: z.string().min(4).max(100).regex(pattern),
  street: z.string().min(4).max(200),
  subdistrict: z.string().min(3).max(100),
  district: z.string().min(3).max(100),
  province: z.string().min(3).max(100),
  country: z.string().min(3).max(100).optional(),
  postal_code: z.string().min(3).max(10),
  whatsapp: z.string().min(8).max(20).regex(pattern).optional(),
  user_id: z.number().min(1).int(),
  is_main_address: z.boolean().default(false),
});

const update = z.object({
  address_id: z.number().min(1).int(),
  user_id: z.number().min(1).int(),
  address_owner: z.string().min(4).max(100).regex(pattern).optional(),
  street: z.string().min(4).max(200).optional(),
  subdistrict: z.string().min(3).max(100).optional(),
  district: z.string().min(3).max(100).optional(),
  province: z.string().min(3).max(100).optional(),
  country: z.string().min(3).max(100).optional(),
  postal_code: z.string().min(3).max(10).optional(),
  whatsapp: z.string().min(8).max(20).regex(pattern).optional(),
  is_main_address: z.boolean().default(false).optional(),
});

export const addressValidation = {
  create,
  update,
};
