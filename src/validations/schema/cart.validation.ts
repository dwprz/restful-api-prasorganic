import z, { ZodType } from "zod";

export class CartValidation {
  private static pattern = /^[^<>/()#=|&!?:;${}]*$/;

  static user_id: ZodType = z.number().min(1).int();

  static page: ZodType = z.number().min(1).int();

  static create: ZodType = z.object({
    user_id: z.number().min(1).int(),
    product_id: z.number().min(1).max(1000000).int(),
    quantity: z.number().min(1).max(1000).int(),
    total_gross_price: z.number().min(1000).max(20000000).int(),
  });

  static getByProductName: ZodType = z.object({
    page: z.number().min(1).int(),
    product_name: z.string().max(100).regex(this.pattern),
  });

  static delete: ZodType = z.object({
    user_id: z.number().min(1).int(),
    cart_item_id: z.number().min(1).int(),
  });
}
