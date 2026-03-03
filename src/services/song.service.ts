import Song, { ISong } from '../models/song.model';
import { CreateSongDto, UpdateSongDto, SongQueryDto } from '../dtos/song.dto';

export class SongService {
  async createSong(songData: CreateSongDto, audioUrl: string, coverImage?: string): Promise<ISong> {
    try {
      const song = new Song({
        ...songData,
        audioUrl,
        coverImage: coverImage || '/upload/images/hello.png',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return await song.save();
    } catch (error) {
      throw new Error(`Failed to create song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllSongs(query: SongQueryDto = {}) {
    try {
      const { page = 1, limit = 50, artist, genre } = query;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (artist) filter.artist = artist;
      if (genre) filter.genre = genre;

      const songs = await Song.find(filter)
        .populate('artist', 'name bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Song.countDocuments(filter);

      return {
        songs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch songs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSongById(id: string): Promise<ISong | null> {
    try {
      return await Song.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSong(id: string, updateData: UpdateSongDto): Promise<ISong | null> {
    try {
      return await Song.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSong(id: string): Promise<boolean> {
    try {
      const result = await Song.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSongsByArtist(artistId: string): Promise<ISong[]> {
    try {
      return await Song.find({ artist: artistId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to fetch songs by artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
