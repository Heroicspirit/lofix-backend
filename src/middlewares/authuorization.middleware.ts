import jwt from "jsonwebtoken"; 
import { JWT_SECRET } from "../config";
import { Request, Response, NextFunction } from "express"; 
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser; 
        }
    }
}

const userRepository = new UserRepository(); 

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Check if header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Unauthorized, Please login first");
        }

        const token = authHeader.split(" ")[1]; 
        
        // 2. Verify Token
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>; 
        
        if (!decodedToken || !decodedToken.id) {
            throw new HttpError(401, "Invalid session, please login again");
        }

        // 3. Find User in DB
        const user = await userRepository.getUserById(decodedToken.id); 
        if (!user) {
            throw new HttpError(401, "User no longer exists");
        }

        // 4. Attach user to request and move to the next step
        req.user = user; 
        next(); 

    } catch (error: any) {
        // Handle JWT specific errors (like expired tokens)
        const message = error.name === "TokenExpiredError" ? "Session expired" : error.message;
        return res.status(401).json({
            success: false, 
            message: message || "Unauthorized"
        });
    }
};