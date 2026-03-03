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

      console.log("=== SONG UPLOAD START ===");

      const { title, artist, album, genre, duration } = req.body;

      

      // Check if files were uploaded

      if (!req.files || !(req.files as MulterFiles).audioFile) {

        console.log("ERROR: No audio file received");

        return res.status(400).json({ 

          success: false, 

          message: "Audio file is required" 

        });

      }



      const files = req.files as MulterFiles;

      const audioFile = files.audioFile[0];

      const coverFile = files.coverImage ? files.coverImage[0] : null;



      console.log("Upload files received:");

      console.log("- Audio file:", audioFile?.filename);

      console.log("- Audio file size:", audioFile?.size);

      console.log("=== SONG UPLOAD PROCESSING ===");



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

        coverImage: coverFile ? `/upload/images/${coverFile.filename}` : "/upload/hello.png",

        audioUrl: `/upload/songs/${audioFile.filename}`,

        genre: genre ? genre.split(',').map((g: string) => g.trim()) : []

      });



      const audioFilePath = path.join(process.cwd(), 'upload/songs', audioFile.filename);

      

      console.log("Saving song with coverImage:", song.coverImage);

      console.log("Audio file path:", audioFilePath);

      console.log("Audio file exists before save:", fs.existsSync(audioFilePath));

      

      try {

        await song.save();

        console.log("Song saved successfully to database");

      } catch (saveError) {

        console.error("Error saving song to database:", saveError);

        return res.status(500).json({

          success: false,

          message: "Failed to save song to database"

        });

      }

      

      // Verify file was actually saved

      const fileExistsAfter = fs.existsSync(audioFilePath);

      console.log("Audio file exists after save:", fileExistsAfter);

      

      if (!fileExistsAfter) {

        console.error("CRITICAL: Audio file was not saved to disk!");

        return res.status(500).json({

          success: false,

          message: "Audio file was not saved to disk"

        });

      }

      

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

        .sort({ createdAt: -1 })

        .skip(skip)

        .limit(limit)

        .populate('artist', 'name bio'); // Populate artist field



      const total = await Song.countDocuments();



      res.status(200).json({

        success: true,

        data: songs  // ← Return songs directly, not nested

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



  async updateSong(req: Request, res: Response) {

    try {

      const { title, album, genre, artist } = req.body;

      

      // Handle file upload for cover image

      const files = req.files as MulterFiles;

      const coverFile = files?.coverImage ? files.coverImage[0] : null;

      

      // Find or create artist if artist name is provided

      let artistId;

      if (artist) {

        let artistDoc = await ArtistModel.findOne({ name: artist });

        if (!artistDoc) {

          artistDoc = new ArtistModel({ 

            name: artist,

            bio: `${artist} - Artist`

          });

          await artistDoc.save();

        }

        artistId = artistDoc._id;

      }

      

      // Prepare update data

      const updateData: any = {

        title,

        album,

        genre: genre ? genre.split(',').map((g: string) => g.trim()) : undefined,

      };

      

      // Add artist if provided

      if (artistId) {

        updateData.artist = artistId;

      }

      

      // Add cover image if uploaded

      if (coverFile) {

        updateData.coverImage = `/upload/images/${coverFile.filename}`;

      }

      

      const song = await Song.findByIdAndUpdate(

        req.params.id,

        updateData,

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

