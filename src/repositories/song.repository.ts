import Song, { ISong } from '../models/song.model';

export class SongRepository {
  async create(songData: Partial<ISong>): Promise<ISong> {
    try {
      const song = new Song(songData);
      return await song.save();
    } catch (error) {
      throw new Error(`Failed to create song in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<ISong | null> {
    try {
      return await Song.findById(id);
    } catch (error) {
      throw new Error(`Failed to find song by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(filter: any = {}, options: any = {}): Promise<ISong[]> {
    try {
      return await Song.find(filter, null, options);
    } catch (error) {
      throw new Error(`Failed to find songs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findOne(filter: any): Promise<ISong | null> {
    try {
      return await Song.findOne(filter);
    } catch (error) {
      throw new Error(`Failed to find song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateById(id: string, updateData: Partial<ISong>): Promise<ISong | null> {
    try {
      return await Song.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Failed to update song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await Song.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(filter: any = {}): Promise<number> {
    try {
      return await Song.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to count songs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
