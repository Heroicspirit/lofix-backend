import mongoose, { Schema, Document } from "mongoose";
import { ISong } from "./song.model";

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  isPublic: boolean;
  coverColor?: string;
  songCount: number;
  userId: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[] | ISong[];
}

const PlaylistSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isPublic: { type: Boolean, default: false },
  coverColor: { type: String, default: "from-blue-500 to-purple-500" },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for song count
PlaylistSchema.virtual('songCount').get(function() {
  return this.songs ? (this.songs as any[]).length : 0;
});

// Index for faster queries
PlaylistSchema.index({ userId: 1, name: 1 });

export const Playlist = mongoose.model<IPlaylist>("Playlist", PlaylistSchema);
export default Playlist;
