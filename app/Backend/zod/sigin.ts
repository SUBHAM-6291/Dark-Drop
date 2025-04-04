import { z } from "zod";

export const signInSchema = z.object({
    name: z.string().min(5, "Name is required").max(10, "Name must be at most 10 characters"),
  email: z.string().email("valid email required "),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
