import { Request, Response } from "express";
import { Song } from "../models/song.model";
import { ArtistModel } from "../models/artist.model";

export class SearchController {
  async globalSearch(req: Request, res: Response) {
    try {
      const { q, type } = req.query;
      const searchRegex = new RegExp(q as string, 'i');

      let results: any = {};

      // Logic to filter based on category
      if (type === 'songs' || type === 'all') {
        results.songs = await Song.find({ title: searchRegex }).limit(5);
      }
      
      if (type === 'artists' || type === 'all') {
        results.artists = await ArtistModel.find({ name: searchRegex }).limit(5);
      }

      return res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Search failed" });
    }
  }
}