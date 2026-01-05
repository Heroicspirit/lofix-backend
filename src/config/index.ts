import dotenv from 'dotenv';
dotenv.config();

export const PORT: number = 
process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGODB_URI: string =
process.env.MONGODB_URL || 'mongodb://localhost:27017/lofix-backend';
export const JWT_SECRET: string = 
process.env.JWT_SECRET || ' default_secret';