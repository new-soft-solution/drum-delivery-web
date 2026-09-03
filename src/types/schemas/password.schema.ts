import { z } from "zod";

const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
};

export const passwordBase = z
  .string()
  .min(PASSWORD_RULES.minLength, `Min ${PASSWORD_RULES.minLength} characters`)
  .regex(PASSWORD_RULES.uppercase, "Must include an uppercase letter (A-Z)")
  .regex(PASSWORD_RULES.lowercase, "Must include a lowercase letter (a-z)")
  .regex(PASSWORD_RULES.number, "Must include a number (0-9)")
  .regex(
    PASSWORD_RULES.special,
    "Must include a special character (e.g. !@#$%^&*)",
  );

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Old password is required"),
    new_password: passwordBase,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: "New password must be different from old password",
    path: ["new_password"],
  });

export type ChangePasswordValues = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export const SetPasswordSchema = z
  .object({
    new_password: passwordBase,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type PasswordFormData = z.infer<typeof SetPasswordSchema>;
export function evaluatePasswordRules(password: string) {
  const pw = password || "";

  return {
    minLength: pw.length >= PASSWORD_RULES.minLength,
    uppercase: PASSWORD_RULES.uppercase.test(pw),
    lowercase: PASSWORD_RULES.lowercase.test(pw),
    number: PASSWORD_RULES.number.test(pw),
    special: PASSWORD_RULES.special.test(pw),
  };
}

export type PasswordRules = ReturnType<typeof evaluatePasswordRules>;
