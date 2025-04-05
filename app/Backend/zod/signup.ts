import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(5, "Name is required").max(10, "Name must be at most 10 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type Signupzod = z.infer<typeof signupSchema>;
