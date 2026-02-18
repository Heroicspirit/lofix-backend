import { Request, Response } from "express";
import { Song } from "../models/song.model";
import { ArtistModel } from "../models/artist.model";
import fs from "fs";
import path from "path";

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

export class SongController {
  /**
   * Upload a new song with metadata
   */
  async uploadSong(req: Request, res: Response) {
    try {
      const { title, artist, album, genre, duration } = req.body;
      
      // Check if files were uploaded
      if (!req.files || !(req.files as MulterFiles).audioFile) {
        return res.status(400).json({ 
          success: false, 
          message: "Audio file is required" 
        });
      }

      const files = req.files as MulterFiles;
      const audioFile = files.audioFile[0];
      const coverFile = files.coverImage ? files.coverImage[0] : null;

      // Find or create artist
      let artistDoc = await ArtistModel.findOne({ name: artist });
      if (!artistDoc) {
        artistDoc = new ArtistModel({ 
          name: artist,
          bio: `${artist} - Artist`
        });
        await artistDoc.save();
      }

      // Create song document
      const song = new Song({
        title,
        artist: artistDoc._id,
        album: album || "Single",
        duration: parseInt(duration) || 180, // Default 3 minutes
        coverImage: coverFile ? `/upload/${coverFile.filename}` : "/upload/hello.png",
        audioUrl: `/upload/songs/${audioFile.filename}`,
        genre: genre ? genre.split(',').map((g: string) => g.trim()) : []
      });

      await song.save();
      
      // Populate artist info for response
      await song.populate('artist', 'name bio');

      res.status(201).json({
        success: true,
        message: "Song uploaded successfully",
        data: song
      });

    } catch (error) {
      console.error("Song upload error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Song upload failed" 
      });
    }
  }

  /**
   * Get all songs with pagination
   */
  async getAllSongs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const songs = await Song.find()
        .populate('artist', 'name bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Song.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          songs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error("Get songs error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch songs" 
      });
    }
  }

  /**
   * Get song by ID
   */
  async getSongById(req: Request, res: Response) {
    try {
      const song = await Song.findById(req.params.id)
        .populate('artist', 'name bio');

      if (!song) {
        return res.status(404).json({ 
          success: false, 
          message: "Song not found" 
        });
      }

      res.status(200).json({
        success: true,
        data: song
      });

    } catch (error) {
      console.error("Get song error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch song" 
      });
    }
  }

  /**
   * Update song metadata
   */
  async updateSong(req: Request, res: Response) {
    try {
      const { title, album, genre } = req.body;
      
      const song = await Song.findByIdAndUpdate(
        req.params.id,
        { title, album, genre: genre ? genre.split(',').map((g: string) => g.trim()) : undefined },
        { new: true, runValidators: true }
      ).populate('artist', 'name bio');

      if (!song) {
        return res.status(404).json({ 
          success: false, 
          message: "Song not found" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Song updated successfully",
        data: song
      });

    } catch (error) {
      console.error("Update song error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update song" 
      });
    }
  }

  /**
   * Delete a song (both file and database record)
   */
  async deleteSong(req: Request, res: Response) {
    try {
      const song = await Song.findById(req.params.id);
      
      if (!song) {
        return res.status(404).json({ 
          success: false, 
          message: "Song not found" 
        });
      }

      // Delete audio file
      const audioPath = path.join(process.cwd(), song.audioUrl);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      // Delete cover image if it's not the default
      if (song.coverImage && !song.coverImage.includes('default-cover')) {
        const coverPath = path.join(process.cwd(), song.coverImage);
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }

      // Delete database record
      await Song.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Song deleted successfully"
      });

    } catch (error) {
      console.error("Delete song error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete song" 
      });
    }
  }

  /**
   * Get songs by artist
   */
  async getSongsByArtist(req: Request, res: Response) {
    try {
      const artistId = req.params.artistId;
      
      const songs = await Song.find({ artist: artistId })
        .populate('artist', 'name bio')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { songs }
      });

    } catch (error) {
      console.error("Get songs by artist error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch artist songs" 
      });
    }
  }

  /**
   * Add existing uploaded songs to database
   */
  async addExistingSongs(req: Request, res: Response) {
    try {
      const songsDir = path.join(process.cwd(), 'upload/songs');
      
      if (!fs.existsSync(songsDir)) {
        return res.status(404).json({ 
          success: false, 
          message: "Songs directory not found" 
        });
      }

      const files = fs.readdirSync(songsDir);
      const mp3Files = files.filter(file => file.endsWith('.mp3'));
      
      const addedSongs = [];
      
      for (const filename of mp3Files) {
        // Extract title from filename (remove extension and clean up)
        const title = filename
          .replace('.mp3', '')
          .replace(/_/g, ' ')
          .replace(/\(.*?\)/g, '') // Remove content in parentheses
          .trim();

        // Check if song already exists
        const existingSong = await Song.findOne({ 
          audioUrl: `/upload/songs/${filename}` 
        });
        
        if (existingSong) {
          continue; // Skip if already in database
        }

        // Create default artist
        let artistDoc = await ArtistModel.findOne({ name: "Unknown Artist" });
        if (!artistDoc) {
          artistDoc = new ArtistModel({ 
            name: "Unknown Artist",
            bio: "Default artist for uploaded songs"
          });
          await artistDoc.save();
        }

        // Create song document
        const song = new Song({
          title: title || filename.replace('.mp3', ''),
          artist: artistDoc._id,
          album: "Uploaded Collection",
          duration: 180, // Default 3 minutes
          coverImage: "/upload/hello.png",
          audioUrl: `/upload/songs/${filename}`,
          genre: ["Unknown"]
        });

        await song.save();
        await song.populate('artist', 'name bio');
        addedSongs.push(song);
      }

      res.status(200).json({
        success: true,
        message: `Added ${addedSongs.length} songs to database`,
        data: { songs: addedSongs }
      });

    } catch (error) {
      console.error("Add existing songs error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to add existing songs" 
      });
    }
  }
}
