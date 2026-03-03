import { Router } from "express";
import { SongController } from "../controllers/song.controller";
import { uploadSongFiles } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authuorization.middleware";

const router = Router();
const songController = new SongController();

// Add existing songs (testing)
router.post("/add-existing", songController.addExistingSongs);

// Upload new song (direct POST to /api/songs)
router.post(
  "/",
  authorizedMiddleware,
  uploadSongFiles.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  songController.uploadSong
);

// Get all songs
router.get("/", songController.getAllSongs);

// Get songs by artist (PLACE BEFORE /:id)
router.get("/artist/:artistId", songController.getSongsByArtist);

// Favorite songs CRUD routes (PLACE BEFORE /:id)
router.post("/favorites", authorizedMiddleware, songController.addToFavorites);
router.get("/favorites", authorizedMiddleware, songController.getFavorites);
router.delete("/favorites/:songId", authorizedMiddleware, songController.removeFromFavorites);

// Get song by ID (KEEP LAST)
router.get("/:id", songController.getSongById);

// Update song
router.put(
  "/:id",
  authorizedMiddleware,
  uploadSongFiles.fields([{ name: "coverImage", maxCount: 1 }]),
  songController.updateSong
);

// Delete song
router.delete("/:id", authorizedMiddleware, songController.deleteSong);

export default router;