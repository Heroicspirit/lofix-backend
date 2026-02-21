import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const maxSize = 50 * 1024 * 1024; // 50MB for audio files (increased from 10MB)
const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "/upload");
const SONGS_UPLOAD_DIR = path.join(process.cwd(), "/upload/songs");
const IMAGES_UPLOAD_DIR = path.join(process.cwd(), "/upload/images");

// Create directories if they don't exist
if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(SONGS_UPLOAD_DIR)) {
  fs.mkdirSync(SONGS_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_UPLOAD_DIR)) {
  fs.mkdirSync(IMAGES_UPLOAD_DIR, { recursive: true });
}

// Combined storage for both images and audio
const combinedStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const imageFields = ["profilePicture", "image", "photo", "coverImage"];
    const audioFields = ["audioFile", "song", "audio"];
    
    if (imageFields.includes(file.fieldname)) {
      if (file.fieldname === "coverImage") {
        cb(null, IMAGES_UPLOAD_DIR);
      } else {
        cb(null, PROFILE_UPLOAD_DIR);
      }
    } else if (audioFields.includes(file.fieldname)) {
      cb(null, SONGS_UPLOAD_DIR);
    } else {
      cb(new Error(`Invalid field name. Expected image or audio field, got: ${file.fieldname}`), "");
    }
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '_');
    const nameWithoutExt = path.basename(originalName, ext);
    
    if (file.fieldname === "audioFile" || file.fieldname === "song" || file.fieldname === "audio") {
      // For audio files, keep more of the original name
      const uniqueName = `${nameWithoutExt}-${uuidv4()}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    } else {
      // For images, use the original naming
      const uniqueName = file.fieldname === "coverImage" 
        ? `cover-${uuidv4()}-${Date.now()}${ext}`
        : `pro-pic-${uuidv4()}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    }
  },
});

// Combined file filter (images and audio)
const combinedFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const imageFields = ["profilePicture", "image", "avatar", "photo", "coverImage"];
  const audioFields = ["audioFile", "song", "audio"];
  
  if (imageFields.includes(file.fieldname)) {
    // Image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed for image fields."));
    }
  } else if (audioFields.includes(file.fieldname)) {
    // Audio files
    const allowedAudioTypes = [
      'audio/mpeg',     // MP3
      'audio/wav',      // WAV
      'audio/ogg',      // OGG
      'audio/mp4',      // M4A
      'audio/x-m4a',    // M4A (alternative)
    ];
    
    if (!allowedAudioTypes.includes(file.mimetype)) {
      return cb(new Error("Only audio files (MP3, WAV, OGG, M4A) are allowed for audio fields."));
    }
  } else {
    return cb(new Error(`Invalid field name. Expected image or audio field, got: ${file.fieldname}`));
  }

  cb(null, true);
};

// Export different upload configurations
export const uploadProfilePicture = multer({
  storage: combinedStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 5MB for images (increased from 2MB)
});

export const uploadSongFiles = multer({
  storage: combinedStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: maxSize }, // 10MB for audio, 2MB for images
});

export const uploadAlbumFiles = multer({
  storage: combinedStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for album cover images
});

// Default export (backward compatibility)
export const upload = uploadProfilePicture;