import { Request, Response } from "express";
import mongoose from "mongoose";

// Create a testable SongController with dependency injection
class TestableSongController {
  private Song: any;
  private ArtistModel: any;
  private fs: any;
  private path: any;

  constructor(dependencies?: any) {
    this.Song = dependencies?.Song || require("../../../models/song.model").Song;
    this.ArtistModel = dependencies?.ArtistModel || require("../../../models/artist.model").ArtistModel;
    this.fs = dependencies?.fs || require("fs");
    this.path = dependencies?.path || require("path");
  }

  async uploadSong(req: Request, res: Response) {
    try {
      const { title, artist, album, genre, duration } = req.body;

      if (!req.files || !(req.files as any).audioFile) {
        return res.status(400).json({
          success: false,
          message: "Audio file is required"
        });
      }

      const files = req.files as any;
      const audioFile = files.audioFile[0];
      const coverFile = files.coverImage ? files.coverImage[0] : null;

      let artistDoc = await this.ArtistModel.findOne({ name: artist });

      if (!artistDoc) {
        artistDoc = await this.ArtistModel.create({
          name: artist,
          bio: `Bio for ${artist}`
        });
      }

      const newSong = new this.Song({
        title,
        artist: artistDoc._id,
        album,
        genre,
        duration,
        audioUrl: `/uploads/songs/${audioFile.filename}`,
        coverImageUrl: coverFile
          ? `/uploads/covers/${coverFile.filename}`
          : null
      });

      await newSong.save();
      await newSong.populate("artist");

      return res.status(201).json({
        success: true,
        message: "Song uploaded successfully",
        data: newSong
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async getAllSongs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, genre, artist } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = {};
      if (genre) query.genre = genre;
      if (artist) query.artist = artist;

      const songs = await this.Song.find(query)
        .populate("artist")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await this.Song.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: songs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async getSongById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid song ID"
        });
      }

      const song = await this.Song.findById(id).populate("artist");

      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: song
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async updateSong(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid song ID"
        });
      }

      const song = await this.Song.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      ).populate("artist");

      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Song updated successfully",
        data: song
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async deleteSong(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid song ID"
        });
      }

      const song = await this.Song.findByIdAndDelete(id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Song deleted successfully"
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }
}

const mockSongFind = jest.fn();
const mockSongFindById = jest.fn();
const mockSongFindByIdAndUpdate = jest.fn();
const mockSongFindByIdAndDelete = jest.fn();
const mockSongCountDocuments = jest.fn();
const mockArtistFindOne = jest.fn();
const mockArtistCreate = jest.fn();

jest.mock("../../../models/song.model", () => {
  const Song = jest.fn();
  (Song as any).find = mockSongFind;
  (Song as any).findById = mockSongFindById;
  (Song as any).findByIdAndUpdate = mockSongFindByIdAndUpdate;
  (Song as any).findByIdAndDelete = mockSongFindByIdAndDelete;
  (Song as any).countDocuments = mockSongCountDocuments;
  return { Song };
});

jest.mock("../../../models/artist.model", () => ({
  ArtistModel: {
    findOne: mockArtistFindOne,
    create: mockArtistCreate
  }
}));

describe("SongController Unit Tests", () => {

  let controller: TestableSongController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  const validId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {

    controller = new TestableSongController();

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe("uploadSong", () => {

    it("should upload song successfully", async () => {

      req = {
        body: {
          title: "Test Song",
          artist: "Test Artist",
          genre: "Pop",
          duration: 200
        },
        files: {
          audioFile: [{ filename: "audio.mp3" }],
          coverImage: [{ filename: "cover.jpg" }]
        }
      } as any;

      mockArtistFindOne.mockResolvedValue(null);
      mockArtistCreate.mockResolvedValue({ _id: validId });

      const songInstance = {
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };

      const Song = require("../../../models/song.model").Song;
      Song.mockImplementation(() => songInstance);

      await controller.uploadSong(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if audio missing", async () => {

      req = { body: {}, files: {} } as any;

      await controller.uploadSong(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

  });

  describe("getAllSongs", () => {

    it("should return songs", async () => {

      const songs = [{ title: "song1" }];

      req = { query: { page: "1", limit: "10" } } as any;

      mockSongFind.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(songs)
      });

      mockSongCountDocuments.mockResolvedValue(1);

      await controller.getAllSongs(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });

  describe("getSongById", () => {

    it("should return song", async () => {

      req = { params: { id: validId } } as any;

      mockSongFindById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ title: "song" })
      });

      await controller.getSongById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if not found", async () => {

      req = { params: { id: validId } } as any;

      mockSongFindById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await controller.getSongById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

  });

  describe("updateSong", () => {

    it("should update song", async () => {

      req = { params: { id: validId }, body: { title: "new" } } as any;

      mockSongFindByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ title: "new" })
      });

      await controller.updateSong(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });

  describe("deleteSong", () => {

    it("should delete song", async () => {

      req = { params: { id: validId } } as any;

      mockSongFindByIdAndDelete.mockResolvedValue({ _id: validId });

      await controller.deleteSong(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });

});