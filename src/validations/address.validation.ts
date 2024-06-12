import z, { ZodType } from "zod";

export class AddressValidation {
  private static pattern = /^[^<>/#=|&!?:;]*$/;

  static user_id: ZodType = z.number().min(1).int();

  static address_id: ZodType = z.number().min(1).int();

  static create: ZodType = z
    .object({
      user_id: z.number().min(1).int(),
      address_owner: z.string().min(4).max(100),
      street: z.string().min(4).max(200),
      subdistrict_id: z.string().min(1).max(5).regex(this.pattern),
      subdistrict: z.string().min(3).max(100).regex(this.pattern),
      city_id: z.string().min(1).max(5).regex(this.pattern),
      city: z.string().min(3).max(100).regex(this.pattern),
      province_id: z.string().min(1).max(5).regex(this.pattern),
      province: z.string().min(3).max(100).regex(this.pattern),
      whatsapp: z.string().min(8).max(20).regex(this.pattern).optional(),
      is_main_address: z.boolean().default(false),
    })
    .strict();

  static update: ZodType = z
    .object({
      address_id: z.number().min(1).int(),
      user_id: z.number().min(1).int(),
      address_owner: z.string().min(4).max(100),
      street: z.string().min(4).max(200),
      subdistrict_id: z.string().min(1).max(5).regex(this.pattern),
      subdistrict: z.string().min(3).max(100).regex(this.pattern),
      city_id: z.string().min(1).max(5).regex(this.pattern),
      city: z.string().min(3).max(100).regex(this.pattern),
      province_id: z.string().min(1).max(5).regex(this.pattern),
      province: z.string().min(3).max(100).regex(this.pattern),
      whatsapp: z.string().min(8).max(20).regex(this.pattern).optional(),
      is_main_address: z.boolean(),
    })
    .strict();
}
