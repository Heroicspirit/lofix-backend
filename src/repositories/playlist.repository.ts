import Playlist, { IPlaylist } from '../models/playlist.model';

export class PlaylistRepository {
  async create(playlistData: Partial<IPlaylist>): Promise<IPlaylist> {
    try {
      const playlist = new Playlist(playlistData);
      return await playlist.save();
    } catch (error) {
      throw new Error(`Failed to create playlist in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<IPlaylist | null> {
    try {
      return await Playlist.findById(id);
    } catch (error) {
      throw new Error(`Failed to find playlist by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByIdWithPopulate(id: string, populateField: string): Promise<IPlaylist | null> {
    try {
      return await Playlist.findById(id).populate(populateField);
    } catch (error) {
      throw new Error(`Failed to find playlist with populate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(filter: any = {}, options: any = {}): Promise<IPlaylist[]> {
    try {
      return await Playlist.find(filter, null, options);
    } catch (error) {
      throw new Error(`Failed to find playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAllWithPopulate(filter: any = {}, populateField: string, options: any = {}): Promise<IPlaylist[]> {
    try {
      return await Playlist.find(filter, null, options).populate(populateField);
    } catch (error) {
      throw new Error(`Failed to find playlists with populate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findOne(filter: any): Promise<IPlaylist | null> {
    try {
      return await Playlist.findOne(filter);
    } catch (error) {
      throw new Error(`Failed to find playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateById(id: string, updateData: Partial<IPlaylist>): Promise<IPlaylist | null> {
    try {
      return await Playlist.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Failed to update playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await Playlist.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(filter: any = {}): Promise<number> {
    try {
      return await Playlist.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to count playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
