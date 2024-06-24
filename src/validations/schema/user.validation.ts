import z, { ZodType } from "zod";

export class UserValidation {
  private static pattern = /^[^<>/()#=|&!?:;${}]*$/;

  static email: ZodType = z.string().min(5).max(100).regex(this.pattern);

  static getByRole: ZodType = z.object({
    page: z.number().min(1).max(100).int(),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  })
  .strict();

  static getByFullName: ZodType = z.object({
    page: z.number().min(1).int(),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
    full_name: z.string().min(3).max(100).regex(this.pattern),
  })
  .strict();

  static updateProfile: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      full_name: z.string().min(3).max(100).regex(this.pattern).optional(),
      address: z.string().min(5).max(500).nullable().optional(),
      whatsapp: z.string().max(20).regex(this.pattern).nullable().optional(),
      password: z.string().min(5).max(100).regex(this.pattern),
    })
    .strict();

  static updatePhotoProfile: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      photo_profile: z.string().max(300).nullable(),
      new_photo_profile: z.string().max(300),
    })
    .strict();

  static updatePassword: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      new_password: z.string().min(5).max(100).regex(this.pattern),
      password: z.string().min(5).max(100).regex(this.pattern),
    })
    .strict();

  static updateEmail: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      new_email: z.string().min(5).max(100).regex(this.pattern),
      otp: z.string().max(6).regex(this.pattern),
    })
    .strict();
}
