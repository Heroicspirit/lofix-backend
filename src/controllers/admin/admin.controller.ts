import { AdminUserService } from "../../services/admin/user.service";
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { createUserDto, CreateUserDTO, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
let adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req:Request, res:Response, next: NextFunction){
        try{
            console.log('Create user request received');
            console.log('Request body:', req.body);
            console.log('Request file:', req.file);
            
            const parsedData = CreateUserDTO.safeParse(req.body);
            if(!parsedData.success){
                console.log('Validation failed:', parsedData.error);
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            if(req.file){
                parsedData.data.profilePicture = `/uploads/${req.file.filename}`;
            }
            const userData: createUserDto = parsedData.data;
            console.log('Processed user data:', userData);
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json(
                {success: true, message: "User created", data: newUser}
            );

        }catch(error: Error | any){
            console.error('Error in createUser:', error);
            return res.status(error.statusCode??500).json(
                {success: false, message: error.message || "Internal Server Error"}
            );
        }
        
        // same as register user controller
    }
    async getUserById(req: Request, res: Response){
        try{
            const userId = req.params.id; // from url /api/admin/users/:id
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                {success:true, data:user, message: "User Fetched"}
            )

        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"}
            );
        }
    }
    async getAllUsers(req: Request, res: Response){
        try{
            const user = await adminUserService.getAllUsers();
            return res.status(200).json(
                {success:true, data: user ,message:"User Fetched"}
            )
        }catch(error:Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message:error.message || "Internal Server Error"}
            )
        }
    }
    async updateOneUser(req:Request, res:Response){
        try{
            const userId = req.params.id;
            const data = req.body; // Use the request body for update data
            const user = await adminUserService.updateUser(userId, data);
            return res.status(200).json(
                {success:true, message:"User Updated"}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"}
            );
        }
    }
    async deleteOneUser(req:Request, res:Response){
        try{
            const userId = req.params.id;
            const user = await adminUserService.deleteUser(userId);
            return res.status(200).json(
                {success:true, message:"User Updated"}
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"}
            );
        }
    }
    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const parsedData = UpdateUserDto.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            
            if(req.file){   
                parsedData.data.profilePicture = `/uploads/${req.file.filename}`;
            }
            const updateData: UpdateUserDto = parsedData.data;
            const updatedUser = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json(
                { success: true, message: "User Updated", data: updatedUser }
            );
        }
        catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const deleted = await adminUserService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
            }
            return res.status(200).json(
                { success: true, message: "User Deleted" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}