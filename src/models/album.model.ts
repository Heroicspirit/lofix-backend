import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
  title: string;
  artist: mongoose.Types.ObjectId;
  description?: string;
  coverImage: string;
  songs: mongoose.Types.ObjectId[];
  releaseDate?: Date;
  genre?: string[];
}

const AlbumSchema: Schema = new Schema({
  title: { type: String, required: true, index: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  description: { type: String },
  coverImage: { type: String, required: true },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  releaseDate: { type: Date, default: Date.now },
  genre: [{ type: String }]
}, { timestamps: true });

AlbumSchema.index({ title: 'text' });

export const Album = mongoose.model<IAlbum>("Album", AlbumSchema);
export default Album;
