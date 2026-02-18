import { Router } from "express";
import { SongController } from "../controllers/song.controller";
import { uploadSongFiles } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authuorization.middleware";

const router = Router();
const songController = new SongController();

/**
 * Song Routes - Complete CRUD operations for songs
 */

// TEMPORARY: Add existing songs without authentication (for testing)
router.post("/add-existing", songController.addExistingSongs);

// Upload a new song (with audio file and optional cover image)
router.post("/upload", 
  authorizedMiddleware, 
  uploadSongFiles.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]), 
  songController.uploadSong
);

// Get all songs with pagination
router.get("/", songController.getAllSongs);

// Get song by ID
router.get("/:id", songController.getSongById);

// Update song metadata
router.put("/:id", authorizedMiddleware, songController.updateSong);

// Delete a song
router.delete("/:id", authorizedMiddleware, songController.deleteSong);

// Get songs by artist
router.get("/artist/:artistId", songController.getSongsByArtist);


router.get("/artist/:artistId", songController.getSongsByArtist);

export default router;
