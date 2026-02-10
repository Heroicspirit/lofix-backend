import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase() {
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("Database connected succesfully");
    }catch (error) {
        console.error("Database error:",error);
        process.exit(1);
    }
}

export async function connectDatabaseTest(){
    try {
        await mongoose.connect(MONGODB_URI + "_test");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}