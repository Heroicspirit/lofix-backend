export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverColor?: string;
}

export interface UpdatePlaylistDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverColor?: string;
}

export interface AddSongToPlaylistDto {
  songId: string;
}

export interface PlaylistQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}
