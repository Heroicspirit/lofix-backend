import mongoose, { Schema, Document } from "mongoose";

export interface IArtist extends Document {
  name: string;
  bio?: string;
  profileImage?: string; // Made optional
  verified: boolean;
}

const ArtistSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  bio: { type: String },
  profileImage: { type: String, required: false }, // Made optional for unknown artists
  verified: { type: Boolean, default: false }
}, { timestamps: true });

ArtistSchema.index({ name: 'text' });

export const ArtistModel = mongoose.model<IArtist>("Artist", ArtistSchema);