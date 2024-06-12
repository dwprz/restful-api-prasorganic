import z, { ZodType } from "zod";

export class RajaOngkirValidation {
  private static pattern = /^[^<>/#=|&!?:;{}]*$/;

  static province_id: ZodType = z.string().min(1).max(5).regex(this.pattern);

  static city_id: ZodType = z.string().min(1).max(5).regex(this.pattern);

  static provinces: ZodType = z.object({
      province_id: z.string().min(1).max(5).regex(this.pattern),
      province: z.string().max(100).regex(this.pattern),
    })
    .strict()
    .array();

  static cities: ZodType = z.object({
      city_id: z.string().min(1).max(5).regex(this.pattern),
      province_id: z.string().min(1).max(5).regex(this.pattern),
      province: z.string().max(100).regex(this.pattern),
      type: z.string().max(50).regex(this.pattern),
      city_name: z.string().max(100).regex(this.pattern),
      postal_code: z.string().max(10).regex(this.pattern),
    })
    .strict()
    .array();

  static subdistricts: ZodType = z.object({
      subdistrict_id: z.string().min(1).max(5).regex(this.pattern),
      province_id: z.string().min(1).max(5).regex(this.pattern),
      province: z.string().min(1).max(100).regex(this.pattern),
      city_id: z.string().min(1).max(5).regex(this.pattern),
      city: z.string().min(1).max(100).regex(this.pattern),
      type: z.string().min(1).max(50).regex(this.pattern),
      subdistrict_name: z.string().min(1).max(100).regex(this.pattern),
    })
    .strict()
    .array();

  static waybillGet: ZodType = z.object({
    waybill_number: z.string().max(100).regex(this.pattern),
    courier: z.string().max(100).regex(this.pattern)
  })

  static waybill: ZodType = z.object({
    delivered: z.boolean(),
    manifest: z.object({
      manifest_code: z.string().max(100).regex(this.pattern),
      manifest_description: z.string().max(100).regex(this.pattern),
      manifest_date: z.string().regex(this.pattern),
      manifest_time: z.string().regex(/^[^<>/#=|&!?;(){}]*$/),
      city_name: z.string().max(100).regex(this.pattern),
    })
  })
}
