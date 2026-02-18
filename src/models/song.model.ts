import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
  title: string;
  artist: mongoose.Types.ObjectId;
  album?: string;
  duration: number; // in seconds
  coverImage: string;
  audioUrl: string;
  genre: string[];
}

const SongSchema: Schema = new Schema({
  title: { type: String, required: true, index: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  album: { type: String },
  duration: { type: Number, required: true },
  coverImage: { type: String, required: true },
  audioUrl: { type: String, required: true },
  genre: [{ type: String }]
}, { timestamps: true });

// This index makes the search query from the previous step much faster
SongSchema.index({ title: 'text' });

export const Song = mongoose.model<ISong>("Song", SongSchema);
export default Song;