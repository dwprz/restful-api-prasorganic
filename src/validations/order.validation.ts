import z from "zod";

const create = z.object({
  order: z.object({
    total_amount: z.number(),
    logistic: z.string(),
    payment_method: z.string(),
    status: z.string(),

    user_id: z.number(),
    username: z.string(),
    full_name: z.string(),
    email: z.string().optional(),

    address_owner: z.string(),
    street: z.string(),
    subdistrict: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string().optional(),
    postal_code: z.string(),
    whatsapp: z.string(),
  }),

  products: z.array(
    z.object({
      product_id: z.number(),
      product_name: z.string(),
      image: z.string(),
      quantity: z.number(),
      price: z.number(),
      total_gross_price: z.number(),
    })
  ),
});

const updateStatus = z.object({
  order_id: z.number().min(1).int(),
  status: z.string(),
});

export const orderValidation = {
  create,
  updateStatus,
};
