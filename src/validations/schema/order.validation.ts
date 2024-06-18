import z, { ZodType } from "zod";

export class OrderValidation {
  static create: ZodType = z.object({
    order: z.object({
      order_id: z.string(),
      gross_amount: z.number(),
      courier: z.string(),
      snap_token: z.string(),
      snap_redirect_url: z.string(),

      user_id: z.number(),
      buyer: z.string(),
      email: z.string().optional(),

      address_owner: z.string(),
      street: z.string(),
      subdistrict: z.string(),
      city: z.string(),
      province: z.string(),
      whatsapp: z.string(),
    }).strict(),

    products: z.array(
      z.object({
        product_id: z.number(),
        product_name: z.string(),
        image: z.string(),
        quantity: z.number(),
        price: z.number(),
        total_gross_price: z.number(),
      }).strict()
    ),
  });
}
