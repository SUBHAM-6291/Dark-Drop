import { z } from 'zod'

export const USER_ZOD = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type UserZodType = z.infer<typeof USER_ZOD>