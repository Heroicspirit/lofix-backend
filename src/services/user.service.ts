import { createUserDto, LoginUserDto} from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import  jwt  from "jsonwebtoken";
import { JWT_SECRET } from "../config";



const userRepository = new UserRepository();

export class UserService {
    async registerUser(data: createUserDto) {
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if(checkEmail) {
            throw new HttpError(403,"Email already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password,10);
        data.password = hashedPassword;
        const newUser =await userRepository.createdUser(data);
        return newUser;
    }
    async loginUser(data : LoginUserDto) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if(!existingUser) {
            throw new HttpError(404, "Email not found");
        }
        const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password);
        if(!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
        };
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'});
        return { token, existingUser}
    }

    async updateUserProfile(userId: string, updateData: any) {
        // Find user by ID
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Update user with new data
        const updatedUser = await userRepository.updateOneUser(userId, updateData);
        return updatedUser;
    }

    async updateUser(userId: string, updateData: any) {
        return await this.updateUserProfile(userId, updateData);
    }

    /**
     * Get User by ID
     */
    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users;
    }

    /**
     * Delete User
     */
    async deleteUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const result = await userRepository.deleteOneUser(userId);
        return result;
    }
}