import mongoose, { Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>({
    name: {type: String, required: true, minlength:3},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength:6},
    role: { type: String, enum: [ 'admin','user'], default: 'user'},
    profilePicture: {type: String, default: null},
},{
    timestamps: true,
});

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User',UserSchema)