import { Router, Request, Response } from "express";
import Playlist from "../models/playlist.model";
import Song, { ISong } from "../models/song.model";
import { authorizedMiddleware, AuthRequest } from "../middlewares/authuorization.middleware";
import fs from 'fs';
import path from 'path';

const router = Router();

// Add routes that match frontend expectations
router.get(
  "/playlists",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user._id;

      const playlists = await Playlist.find({ userId })
        .populate('songs', 'title artist coverImage album duration audioUrl');

      return res.status(200).json({
        success: true,
        data: playlists,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch playlists",
        error: error?.message,
      });
    }
  }
);

router.post(
  "/playlists",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      const userId = (req as AuthRequest).user._id;

      const playlist = await Playlist.create({
        name,
        description,
        userId: userId,
      });

      return res.status(201).json({
        success: true,
        data: playlist,
      });
    } catch (err: Error | any) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to create playlist",
      });
    }
  }
);

router.get(
  "/playlists/:id",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user._id;
      const playlist = await Playlist.findOne({ _id: req.params.id, userId })
        .populate('songs', 'title artist duration album');
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      return res.status(200).json({
        success: true,
        data: playlist,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch playlist",
        error: error.message,
      });
    }
  }
);

router.put(
  "/playlists/:id",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user._id;
      const { name, description } = req.body;
      
      const playlist = await Playlist.findOne({ _id: req.params.id, userId });
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      if (name) playlist.name = name;
      if (description !== undefined) playlist.description = description;
      
      await playlist.save();
      
      return res.status(200).json({
        success: true,
        data: playlist,
        message: "Playlist updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to update playlist",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/playlists/:id",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user._id;
      const playlist = await Playlist.findOne({ _id: req.params.id, userId });
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      await playlist.deleteOne();
      
      return res.status(200).json({
        success: true,
        message: "Playlist deleted",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete playlist",
        error: error.message,
      });
    }
  }
);

router.get(
  "/playlists/:id/songs",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as AuthRequest).user._id;
      
      const playlist = await Playlist.findOne({ _id: id, userId })
        .populate('songs', 'title artist coverImage album duration audioUrl');
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      return res.status(200).json({
        success: true,
        data: playlist.songs,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch playlist songs",
        error: error.message,
      });
    }
  }
);

router.post(
  "/playlists/:id/songs",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { songId } = req.body;
      const userId = (req as AuthRequest).user._id;
      
      const playlist = await Playlist.findOne({ _id: id, userId });
      const song = await Song.findById(songId);
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found",
        });
      }
      
      // Check if song is already in playlist
      if (playlist.songs.includes(songId)) {
        return res.status(400).json({
          success: false,
          message: "Song is already in playlist",
        });
      }
      
      playlist.songs.push(songId as any);
      await playlist.save();
      
      res.json({
        success: true,
        message: "Song added to playlist successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to add song to playlist",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/playlists/:id/songs/:songId",
  authorizedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id, songId } = req.params;
      const userId = (req as AuthRequest).user._id;
      
      const playlist = await Playlist.findOne({ _id: id, userId });
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      
      playlist.songs = playlist.songs.filter(song => song.toString() !== songId) as any[];
      await playlist.save();
      
      res.json({
        success: true,
        message: "Song removed from playlist successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to remove song from playlist",
        error: error.message,
      });
    }
  }
);

export default router;