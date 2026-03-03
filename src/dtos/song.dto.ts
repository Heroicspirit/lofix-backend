export interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string;
}

export interface UpdateSongDto {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  genre?: string;
  coverImage?: string;
}

export interface SongQueryDto {
  page?: number;
  limit?: number;
  artist?: string;
  genre?: string;
}
