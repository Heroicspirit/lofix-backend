import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";


const maxSize = 2 * 1024 * 1024; // 2MB
const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "/upload");



if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const allowedFieldNames = ["profilePicture", "image", "avatar", "photo", "file"];
    
    if (allowedFieldNames.includes(file.fieldname)) {
      cb(null, PROFILE_UPLOAD_DIR);
    } else {
      cb(new Error(`Invalid field name for upload. Expected one of: ${allowedFieldNames.join(', ')}, got: ${file.fieldname}`), "");
    }
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `pro-pic-${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedFieldNames = ["profilePicture", "image", "avatar", "photo", "file"];
  
  if (!allowedFieldNames.includes(file.fieldname)) {
    return cb(new Error(`Invalid field name for upload. Expected one of: ${allowedFieldNames.join(', ')}, got: ${file.fieldname}`));
  }

  // 1. MIME type check
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }


  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});



export const upload = uploadProfilePicture;