import z, { ZodType } from "zod";

export class AddressValidation {
  private static pattern = /^[^<>/()#=|&!?:;]*$/;

  static user_id: ZodType= z.number().min(1).int();

  static address_id: ZodType= z.number().min(1).int();

  static create: ZodType = z.object({
    address_owner: z.string().min(4).max(100),
    street: z.string().min(4).max(200),
    subdistrict: z.string().min(3).max(100).regex(this.pattern),
    district: z.string().min(3).max(100).regex(this.pattern),
    province: z.string().min(3).max(100).regex(this.pattern),
    country: z.string().min(3).max(100).regex(this.pattern).nullable().optional(),
    postal_code: z.string().min(3).max(10).regex(this.pattern),
    whatsapp: z.string().min(8).max(20).regex(this.pattern).optional(),
    user_id: z.number().min(1).int(),
    is_main_address: z.boolean().default(false),
  })
  .strict();

  static update: ZodType = z.object({
    address_id: z.number().min(1).int(),
    user_id: z.number().min(1).int(),
    address_owner: z.string().min(4).max(100),
    street: z.string().min(4).max(200),
    subdistrict: z.string().min(3).max(100).regex(this.pattern),
    district: z.string().min(3).max(100).regex(this.pattern),
    province: z.string().min(3).max(100).regex(this.pattern),
    country: z.string().min(3).max(100).regex(this.pattern).nullable(),
    postal_code: z.string().min(3).max(10).regex(this.pattern),
    whatsapp: z.string().min(8).max(20).regex(this.pattern),
    is_main_address: z.boolean().default(false),
  })
  .strict();
}

