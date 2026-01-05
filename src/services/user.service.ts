import { createUserDto, LoginUserDto} from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import  jwt  from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { email } from "zod";


let userRepository = new UserRepository();

export class UserService {
    async registerUser(data: createUserDto) {
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if(checkEmail) {
            throw new HttpError(403,"Email already in use");
        }
        const checkUsername = await userRepository.getUserByName(data.name);
        if(checkUsername) {
            throw new HttpError(403,"Username already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password,10);
        data.password = hashedPassword;
        const newUser =await userRepository.createdUser(data);
        return newUser;
    }
    async loginUser(data : LoginUserDto) {
        const existingUser = await userRepository.getUserByName(data.name);
        if(!existingUser) {
            throw new HttpError(404, "User not found");
        }
        const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password);
        if(!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: existingUser._id,
            username: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
        };
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'});
        return { token, existingUser}
    }
}