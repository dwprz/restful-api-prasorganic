import z, { ZodType } from "zod";

export class ReviewValidation {
  private static pattern = /^[^<>#=|&!?:;${}]*$/;

  static page: ZodType = z.object({
    page: z.number().int().max(100),
  })

  static create: ZodType = z.object({
    user_id: z.number().int(),
    product_id: z.number().int(),
    quantity: z.number().int(),
    rating: z.number().int().max(5),
    review: z.string().max(1000).regex(this.pattern).nullable(),
  }).strict().array().max(10);

  static getByRating: ZodType = z.object({
    rating: z.number().int(),
    page: z.number().int().max(100),
  }).strict();

  static getByProductName:  ZodType = z.object({
    product_name: z.string().max(100).regex(this.pattern),
    page: z.number().int().max(100),
  })

  static updateHighlight: ZodType = z.object({
    user_id: z.number().int(),
    product_id: z.number().int(),
    is_highlight: z.boolean(),
  }).strict()
}
