import z, { email } from 'zod';

export const UserSchema = z.object({
    name:z.string().min(3),
    email: z.string().min(6),
    password:z.string().min(6),
    profilePicture: z.string().url("Invalid URL format").optional(),
    role: z.enum(['admin','user']).default('user'),
});
export type UserType = z.infer<typeof UserSchema>;