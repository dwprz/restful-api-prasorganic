import z, { ZodType } from "zod";

export class AuthValidation {
  private static pattern = /^[^<>/()#=|&!?:;${}]*$/;

  static email: ZodType = z.string().min(5).max(100).regex(this.pattern);

  static otp: ZodType = z.object({
    email: z.string().min(5).max(100).regex(this.pattern),
    otp: z.string().max(6).regex(this.pattern),
  })
  .strict();

  static register: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      full_name: z.string().min(3).max(100).regex(this.pattern),
      password: z.string().min(5).max(100).regex(this.pattern),
    })
    .strict();

  static authenticate: ZodType = z.object({
    email: z.string().min(5).max(100).regex(this.pattern),
    password: z.string().min(5).max(100).regex(this.pattern),
  })
  .strict();

  static loginWithGoogle: ZodType = z
    .object({
      email: z.string().min(5).max(100).regex(this.pattern),
      full_name: z.string().min(3).max(100).regex(this.pattern),
      photo_profile: z.string().min(5).max(300).nullable(),
    })
    .strict();
}
