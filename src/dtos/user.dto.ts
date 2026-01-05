import z from 'zod';
import { UserSchema } from '../types/user.type';

export const CreateUserDto = UserSchema.pick (
    {
        name: true,
        email: true,
        password: true,
    }
). extend ( 
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
export type createUserDto = z.infer<typeof CreateUserDto>;


export const LoginUserDto = z.object({
    name: z.string().min(3),
    password: z.string().min(6),
})
export type LoginUserDto = z.infer<typeof LoginUserDto>