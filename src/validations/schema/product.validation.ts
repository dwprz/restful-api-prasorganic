import z, { ZodType } from "zod";

export class ProductValidation {
  private static pattern = /^[^<>/()#=|&!?:;${}]*$/;

  static page: ZodType = z.number().min(1).max(100).default(1);

  static ptoduct_id: ZodType = z.number().min(1).int();

  static create: ZodType = z
    .object({
      product_name: z.string().trim().max(100).min(3).regex(this.pattern),
      image: z.string().trim().max(250).min(3),
      price: z.number().max(16000000).min(1000),
      stock: z.number().max(16000000).min(1).int(),
      length: z.number().int(),
      width: z.number().int(),
      height: z.number().int(),
      weight: z.number(),
      description: z.string().trim().max(300).min(5).regex(this.pattern).optional(),
      categories: z.union([
        z.array(z.string().max(20).min(3).regex(this.pattern)).min(1).max(10),
        z.string().max(20).min(3).regex(this.pattern),
      ]),
    })
    .strict();

  static productQuery: ZodType = z
    .object({
      page: z.number().min(1).max(100).default(1),
      name: z.string().max(20).regex(this.pattern).optional(),
      categories: z
        .union([
          z.array(z.string().min(3).max(20).regex(this.pattern)).min(1).max(3),
          z.string().min(3).max(20).regex(this.pattern),
        ])
        .optional(),
    })
    .strict();

  static update: ZodType = z
    .object({
      product_id: z.number().min(1).int(),
      product_name: z.string().trim().min(3).max(100).regex(this.pattern).optional(),
      rating: z.number().max(5).nullable().optional(),
      sold: z.number().nullable().optional(),
      price: z.number().min(1000).max(15000000).optional(),
      stock: z.number().max(15000000).int().optional(),
      length: z.number().int().optional(),
      width: z.number().int().optional(),
      height: z.number().int().optional(),
      weight: z.number().optional(),
      description: z.string().trim().max(300).min(5).regex(this.pattern).nullable().optional(),
      is_top_product: z.boolean().optional(),
    })
    .strict();

  static updateImage: ZodType = z
    .object({
      product_id: z.number().min(1).int(),
      image: z.string().max(500).nullable(),
      new_image: z.string().max(500),
    })
    .strict();

  static updateCategories: ZodType = z
    .object({
      product_id: z.number().min(1).int(),
      categories: z.union([
        z.array(z.string().max(20).min(3).regex(this.pattern)).min(1).max(10),
        z.string().max(20).min(3).regex(this.pattern),
      ]),
      new_categories: z.union([
        z.array(z.string().max(20).min(3).regex(this.pattern)).min(1).max(10),
        z.string().max(20).min(3).regex(this.pattern),
      ]),
    })
    .strict();
}
