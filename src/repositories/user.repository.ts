import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
    createdUser(Data: Partial<IUser>): Promise<IUser>;
    getUserByName(name: string): Promise<IUser | null >;
    getUserByEmail(email: string): Promise<IUser| null >;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser []>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteOneUser(id: string): Promise<boolean | null>;
}
export class UserRepository implements IUserRepository {
    async createdUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }
    async getUserByName(name: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"username":name});
        return user;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email":email});
        return user;
    }
    async getUserById(id: string): Promise<IUser | null> {

        const user = await UserModel.findOne();
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updateUser = await UserModel.findByIdAndUpdate(id, data, { new: true});
        return updateUser;
    }
    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true: null;
    }
    }
    

