import z, { ZodType } from "zod";

export class OrderValidation {
  private static pattern = /^[^<>#=|&!?:;${}]*$/;

  static order_id: ZodType = z.string().max(100).regex(this.pattern);

  static create: ZodType = z.object({
    order: z.object({
      order_id: z.string().max(100).regex(this.pattern),
      gross_amount: z.number(),
      
      courier: z.string().max(50).regex(this.pattern),
      rate_id: z.number().int(),
      rate_name: z.string().max(50).regex(this.pattern),
      rate_type: z.string().max(50).regex(this.pattern),
      cod: z.boolean().default(false),
      use_insurance: z.boolean().default(false),
      package_type: z.number().int().max(3),

      snap_token: z.string(),
      snap_redirect_url: z.string(),

      user_id: z.number(),
      buyer: z.string().max(100).regex(this.pattern),
      email: z.string().max(100).regex(this.pattern),

      length: z.number().int(),
      width: z.number().int(),
      height: z.number().int(),
      weight: z.number(),

      address_owner: z.string().max(100).regex(this.pattern),
      street: z.string(),
      area_id: z.number().int(),
      area: z.string().max(100).regex(this.pattern),
      lat: z.string().max(100).regex(this.pattern),
      lng: z.string().max(100).regex(this.pattern),
      suburb: z.string().max(100).regex(this.pattern),
      city: z.string().max(100).regex(this.pattern),
      province: z.string().max(100).regex(this.pattern),
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
  }).strict();

  static getByUserId: ZodType = z.object({
    user_id: z.number().int(),
    page: z.number().int().max(100),
  }).strict();

  static getByStatus: ZodType = z.object({
    status: z.enum([
      "PENDING_PAYMENT", 
      "PAID", 
      "IN_PROGRESS", 
      "COMPLETED", 
      "CANCELLED", 
      "FAILED", 
      "REFUND_PROCESSING",
      "REFUND_COMPLETED",
      "RETURN_PROCESSING", 
      "RETURN_COMPLETED",
      "LOST_OR_DAMAGED"]).nullable(),

    page: z.number().int().max(100),
  }).strict();

  static addShippingId: ZodType = z.object({
    order_id: z.string().max(100).regex(this.pattern),
    shipping_id: z.string().max(100).regex(this.pattern),
  }).strict()

  static cancel: ZodType = z.object({
    user_id: z.number().int(),
    order_id: z.string().max(100).regex(this.pattern),
  }).strict();

  static update: ZodType =  z.object({
    order_id: z.string().max(100).regex(this.pattern),
    status: z.enum([
      "PENDING_PAYMENT", 
      "PAID", 
      "IN_PROGRESS", 
      "COMPLETED", 
      "CANCELLED", 
      "FAILED", 
      "REFUND_PROCESSING",
      "REFUND_COMPLETED",
      "RETURN_PROCESSING", 
      "RETURN_COMPLETED",
      "LOST_OR_DAMAGED"]),
  }).strict();
}