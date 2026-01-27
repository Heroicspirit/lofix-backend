import z from 'zod';
import { UserSchema } from '../types/user.type';

export const CreateUserDTO = z.object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    role: z.enum(["user", "admin"]).optional().default("user")
}). extend ( 
    {
        confirmPassword: z.string().min(6),
    }
).refine ( 
    
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    
);
export type createUserDto = z.infer<typeof CreateUserDTO>;


export const LoginUserDto = z.object({
    email: z.string().min(6),
    password: z.string().min(6),
})
export type LoginUserDto = z.infer<typeof LoginUserDto>

export const UpdateUserDto = z.object({
    fullName: z.string().min(2, "Full name is required").optional(),
    username: z.string().min(2, "Username is required").optional(),
    profilePicture: z.string().optional().nullable(),
    imageUrl: z.string().optional()
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;