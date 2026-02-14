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
    if (file.fieldname === "profilePicture" || file.fieldname === "image") {
      cb(null, PROFILE_UPLOAD_DIR);
    } else {
      cb(new Error("Invalid field name for upload."), "");
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
  if (file.fieldname !== "profilePicture" && file.fieldname !== "image") {
    return cb(new Error("Invalid field name for upload."));
  }

  // 1. MIME type check
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  // // 2. Extension check
  // if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
  //   return cb(new Error("Image format not supported."));
  // }

  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});


export const uploadImage = uploadProfilePicture;
export const upload = uploadProfilePicture;