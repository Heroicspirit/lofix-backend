import { CreateUserDTO, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { Song } from "../models/song.model";
import { ArtistModel } from "../models/artist.model";

import z, { json, success } from "zod";
let userService = new UserService();
export class AuthController{
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if( !parsedData.success) {
                return res.status(400).json(
                    ( {success: false, message: z.prettifyError(parsedData.error)} )
                );
            }
            const newUser = await userService.registerUser(parsedData.data);
            return res.status(201).json(
                    ( {success: true, data: newUser, message: (" Register success") } )
                );
            
        } catch (error: Error | any ) {
            return res.status(error.statusCode || 500).json(
                    ( {success: false, message: error.message || " Internal Server Error" } )
            );
        }
    }
    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if(!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
                const { token, existingUser } = await userService.loginUser(parsedData.data);
                return res.status(200).json(
                    { success: true, data: existingUser, token, message:" Login success"}
                );
            } catch (error: Error | any) {
                return res.status(error.statusCode || 500).json(
                    {success: false, message:error.message || "Internet Server Error"}
                );
        }
    }

    
    updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User Id Not found"
                });
            }

            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors
                });
            }

            // If a file was uploaded by Multer (handle both single file and array)
            if (req.file) {
                parsedData.data.profilePicture = `/upload/${req.file.filename}`;
            } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                parsedData.data.profilePicture = `/upload/${req.files[0].filename}`;
            }

            const updatedUser = await userService.updateUser(userId, parsedData.data);

            // FIX: Null check to satisfy TypeScript and handle missing users
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found or update failed"
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedUser,
                // Handle both single file and array cases
                filename: req.file ? req.file.filename : 
                         (req.files && Array.isArray(req.files) && req.files.length > 0) ? req.files[0].filename : 
                         updatedUser.profilePicture,
                message: "User profile updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    getProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User Id Not found"
                });
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: "Profile retrieved successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                {
                    success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent."
                }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

            const token = req.params.token as string;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async search(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(200).json({
          success: true,
          data: { songs: [], artists: [] } 
        });
      }

      const searchRegex = new RegExp(q as string, 'i');

      // Search across both models
      const [songs, artists] = await Promise.all([
        Song.find({ title: searchRegex }).populate('artist').limit(5),
        ArtistModel.find({ name: searchRegex }).limit(5)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          songs,
          artists
        }
      });
    } catch (error: any) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Search failed" 
      });
    }
  }
}