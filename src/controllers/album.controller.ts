import { Request, Response } from "express";
import { Album } from "../models/album.model";
import { Song } from "../models/song.model";
import { ArtistModel } from "../models/artist.model";
import fs from "fs";
import path from "path";

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

export class AlbumController {
  /**
   * Create a new album
   */
  async createAlbum(req: Request, res: Response) {
    try {
      const { title, artist, description, genre } = req.body;
      
      // Check if cover image was uploaded
      if (!req.files || !(req.files as MulterFiles).coverImage) {
        return res.status(400).json({ 
          success: false, 
          message: "Cover image is required" 
        });
      }

      const files = req.files as MulterFiles;
      const coverFile = files.coverImage[0];

      // Move cover image to images folder
      const imagesDir = path.join(process.cwd(), 'upload/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const coverImagePath = path.join(imagesDir, coverFile.filename);
      fs.renameSync(coverFile.path, coverImagePath);

      // Find or create artist
      let artistDoc = await ArtistModel.findOne({ name: artist });
      if (!artistDoc) {
        artistDoc = new ArtistModel({ 
          name: artist,
          bio: `${artist} - Artist`
        });
        await artistDoc.save();
      }

      // Create album document
      const album = new Album({
        title,
        artist: artistDoc._id,
        description,
        coverImage: `/upload/images/${coverFile.filename}`,
        genre: genre ? genre.split(',').map((g: string) => g.trim()) : [],
        songs: []
      });

      await album.save();
      await album.populate('artist', 'name bio');

      res.status(201).json({
        success: true,
        message: "Album created successfully",
        data: album
      });

    } catch (error) {
      console.error("Album creation error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Album creation failed" 
      });
    }
  }

  /**
   * Get all albums with pagination
   */
  async getAllAlbums(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const albums = await Album.find()
        .populate('artist', 'name bio')
        .populate('songs', 'title duration audioUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Album.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          albums,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error("Get albums error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch albums" 
      });
    }
  }

  /**
   * Get album by ID
   */
  async getAlbumById(req: Request, res: Response) {
    try {
      const album = await Album.findById(req.params.id)
        .populate('artist', 'name bio')
        .populate('songs', 'title duration audioUrl coverImage');

      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }

      res.status(200).json({
        success: true,
        data: album
      });

    } catch (error) {
      console.error("Get album error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch album" 
      });
    }
  }

  /**
   * Update album
   */
  async updateAlbum(req: Request, res: Response) {
    try {
      const { title, description, genre } = req.body;
      
      const album = await Album.findByIdAndUpdate(
        req.params.id,
        { title, description, genre: genre ? genre.split(',').map((g: string) => g.trim()) : undefined },
        { new: true, runValidators: true }
      ).populate('artist', 'name bio');

      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Album updated successfully",
        data: album
      });

    } catch (error) {
      console.error("Update album error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update album" 
      });
    }
  }

  /**
   * Delete album
   */
  async deleteAlbum(req: Request, res: Response) {
    try {
      const album = await Album.findById(req.params.id);
      
      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }

      // Delete cover image
      if (album.coverImage && !album.coverImage.includes('default-cover')) {
        const coverPath = path.join(process.cwd(), album.coverImage);
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }

      // Delete database record
      await Album.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Album deleted successfully"
      });

    } catch (error) {
      console.error("Delete album error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete album" 
      });
    }
  }

  /**
   * Add song to album
   */
  async addSongToAlbum(req: Request, res: Response) {
    try {
      const { albumId, songId } = req.body;
      
      const album = await Album.findByIdAndUpdate(
        albumId,
        { $addToSet: { songs: songId } },
        { new: true }
      ).populate('artist', 'name bio');

      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Song added to album successfully",
        data: album
      });

    } catch (error) {
      console.error("Add song to album error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to add song to album" 
      });
    }
  }

  /**
   * Remove song from album
   */
  async removeSongFromAlbum(req: Request, res: Response) {
    try {
      const { albumId, songId } = req.body;
      
      const album = await Album.findByIdAndUpdate(
        albumId,
        { $pull: { songs: songId } },
        { new: true }
      ).populate('artist', 'name bio');

      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Song removed from album successfully",
        data: album
      });

    } catch (error) {
      console.error("Remove song from album error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to remove song from album" 
      });
    }
  }
}
