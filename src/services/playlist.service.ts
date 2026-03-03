import Playlist, { IPlaylist } from '../models/playlist.model';
import Song, { ISong } from '../models/song.model';
import { CreatePlaylistDto, UpdatePlaylistDto, AddSongToPlaylistDto, PlaylistQueryDto } from '../dtos/playlist.dto';
import mongoose from 'mongoose';

export class PlaylistService {
  async createPlaylist(userId: string, playlistData: CreatePlaylistDto): Promise<IPlaylist> {
    try {
      const playlist = new Playlist({
        ...playlistData,
        userId,
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return await playlist.save();
    } catch (error) {
      throw new Error(`Failed to create playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllPlaylists(userId: string, query: PlaylistQueryDto = {}) {
    try {
      const { page = 1, limit = 20, search } = query;
      const skip = (page - 1) * limit;

      const filter: any = { userId };
      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      const playlists = await Playlist.find(filter)
        .populate('songs', 'title artist coverImage album duration audioUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Playlist.countDocuments(filter);

      return {
        playlists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlaylistById(id: string): Promise<IPlaylist | null> {
    try {
      return await Playlist.findById(id).populate('songs', 'title artist coverImage album duration audioUrl');
    } catch (error) {
      throw new Error(`Failed to fetch playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePlaylist(id: string, updateData: UpdatePlaylistDto): Promise<IPlaylist | null> {
    try {
      return await Playlist.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePlaylist(id: string): Promise<boolean> {
    try {
      const result = await Playlist.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addSongToPlaylist(playlistId: string, songData: AddSongToPlaylistDto): Promise<IPlaylist | null> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const song = await Song.findById(songData.songId);
      if (!song) {
        throw new Error('Song not found');
      }

      // Check if song already exists in playlist
      if (playlist.songs.includes(songData.songId as any)) {
        throw new Error('Song already exists in playlist');
      }

      playlist.songs.push(songData.songId as any);
      // updatedAt is handled automatically by timestamps
      return await playlist.save();
    } catch (error) {
      throw new Error(`Failed to add song to playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<IPlaylist | null> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      playlist.songs = playlist.songs.filter(id => id.toString() !== songId) as mongoose.Types.ObjectId[];
      // updatedAt is handled automatically by timestamps
      return await playlist.save();
    } catch (error) {
      throw new Error(`Failed to remove song from playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlaylistSongs(playlistId: string): Promise<ISong[]> {
    try {
      const playlist = await Playlist.findById(playlistId).populate('songs');
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Handle the populated songs properly
      const songs = playlist.songs as any[];
      return songs.filter(song => song && song.title); // Filter out any invalid entries
    } catch (error) {
      throw new Error(`Failed to fetch playlist songs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
