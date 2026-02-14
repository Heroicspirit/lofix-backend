import { createUserDto, CreateUserDTO, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../../errors/http-error";

let userRepository = new UserRepository();

export class AdminUserService {
    async createUser(data: createUserDto ){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        const newUser = await userRepository.createdUser(data);
        return newUser;
    }

    async getAllUsers(
        page?: string, size?: string, search?: string
    ){
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const {user, total} = await userRepository.getAllUsers(
            pageNumber, pageSize, search
        );
        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize)
        }
        
        //transform/map data if needed
        return {user, pagination};
    }

    async updateOneUser(id:string, data: any){
        const user = await userRepository.updateOneUser(id, data);
        return user;
    }
    async deleteOneUser(id:string ){
        const user = await userRepository.deleteOneUser(id);
        return user;
    }


    async deleteUser(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const deleted = await userRepository.deleteOneUser(id);
        return deleted;
    }

    async updateUser(id: string, updateData: UpdateUserDto){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await userRepository.updateOneUser(id, updateData);
        return updatedUser;
    }

    async  getUserById(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

}