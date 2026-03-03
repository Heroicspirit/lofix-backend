import { Router } from "express";
import { AlbumController } from "../controllers/album.controller";
import { uploadAlbumFiles } from "../middlewares/upload.middleware";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authuorization.middleware";

const router = Router();
const albumController = new AlbumController();

/**
 * Album Routes - Complete CRUD operations for albums
 */

// Create a new album (with cover image)
router.post("/", 
  authorizedMiddleware, 
  adminMiddleware,
  uploadAlbumFiles.single('coverImage'), 
  albumController.createAlbum
);

// Get all albums with pagination
router.get("/", albumController.getAllAlbums);

// Get album by ID
router.get("/:id", albumController.getAlbumById);

// Update album metadata
router.put("/:id", authorizedMiddleware, adminMiddleware, albumController.updateAlbum);

// Delete an album
router.delete("/:id", authorizedMiddleware, adminMiddleware, albumController.deleteAlbum);

// Add song to album
router.post("/add-song", authorizedMiddleware, adminMiddleware, albumController.addSongToAlbum);

// Remove song from album
router.post("/remove-song", authorizedMiddleware, adminMiddleware, albumController.removeSongFromAlbum);

export default router;
