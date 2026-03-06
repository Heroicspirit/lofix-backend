import { SongService } from '../../../services/song.service';
import { CreateSongDto } from '../../../dtos/song.dto';
import { HttpError } from '../../../errors/http-error';
import mongoose from 'mongoose';

// Mock the actual Song model to prevent database calls
jest.mock("../../../models/song.model");

describe('SongService Unit Tests', () => {
    let songService: SongService;
    let mockSongModel: any;

    beforeEach(() => {
        songService = new SongService();
        mockSongModel = require("../../../models/song.model").Song;
        
        // Mock all model methods
        mockSongModel.create = jest.fn();
        mockSongModel.findById = jest.fn();
        mockSongModel.find = jest.fn();
        mockSongModel.findByIdAndUpdate = jest.fn();
        mockSongModel.findByIdAndDelete = jest.fn();
        mockSongModel.countDocuments = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSong', () => {
        test('should create a song successfully', async () => {
            const songData: CreateSongDto = {
                title: 'Test Song',
                artist: '507f1f77bcf86cd799439011',
                album: '507f1f77bcf86cd799439012',
                duration: 240,
                genre: 'Pop'
            };
            const audioUrl = '/test-audio.mp3';
            const coverImage = '/test-cover.jpg';

            const mockSong = {
                _id: 'song123',
                ...songData,
                audioUrl,
                coverImage,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Mock the Song constructor and save method
            const mockSongInstance = {
                save: jest.fn().mockResolvedValue(mockSong)
            };
            mockSongModel.mockImplementation(() => mockSongInstance);

            const result = await songService.createSong(songData, audioUrl, coverImage);

            expect(mockSongModel).toHaveBeenCalledWith({
                ...songData,
                audioUrl,
                coverImage,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            });
            expect(mockSongInstance.save).toHaveBeenCalled();
            expect(result).toEqual(mockSong);
        });

        test('should throw error if creation fails', async () => {
            const songData: CreateSongDto = {
                title: 'Test Song',
                artist: '507f1f77bcf86cd799439011',
                duration: 240,
                genre: 'Pop'
            };
            const audioUrl = '/test-audio.mp3';

            // Mock the Song constructor and save method
            const mockSongInstance = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            mockSongModel.mockImplementation(() => mockSongInstance);

            await expect(songService.createSong(songData, audioUrl)).rejects.toThrow('Failed to create song: Database error');
        });
    });

    describe('getSongById', () => {
        test('should get song by id successfully', async () => {
            const songId = 'song123';
            const mockSong = {
                _id: songId,
                title: 'Test Song',
                artist: '507f1f77bcf86cd799439011',
                album: '507f1f77bcf86cd799439012',
                duration: 240,
                genre: 'Pop',
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockSongModel.findById.mockResolvedValue(mockSong);

            const result = await songService.getSongById(songId);

            expect(mockSongModel.findById).toHaveBeenCalledWith(songId);
            expect(result).toEqual(mockSong);
        });

        test('should return null if song not found', async () => {
            const songId = 'song123';

            mockSongModel.findById.mockResolvedValue(null);

            const result = await songService.getSongById(songId);
            expect(result).toBeNull();
        });

        test('should throw error if retrieval fails', async () => {
            const songId = 'song123';

            mockSongModel.findById.mockRejectedValue(new Error('Database error'));

            await expect(songService.getSongById(songId)).rejects.toThrow('Failed to fetch song: Database error');
        });
    });

    describe('getAllSongs', () => {
        test('should get all songs successfully', async () => {
            const mockSongs = [
                {
                    _id: 'song123',
                    title: 'Test Song',
                    artist: '507f1f77bcf86cd799439011',
                    album: '507f1f77bcf86cd799439012',
                    duration: 240,
                    genre: 'Pop',
                    audioUrl: '/test-audio.mp3',
                    coverImage: '/test-cover.jpg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: 'song456',
                    title: 'Test Song 2',
                    artist: '507f1f77bcf86cd799439011',
                    album: '507f1f77bcf86cd799439012',
                    duration: 240,
                    genre: 'Pop',
                    audioUrl: '/test-audio2.mp3',
                    coverImage: '/test-cover2.jpg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            const mockResult = {
                songs: mockSongs,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: 2,
                    pages: 1
                }
            };

            // Mock the populate chain
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockSongs)
            };
            mockSongModel.find.mockReturnValue(mockQuery);
            mockSongModel.countDocuments.mockResolvedValue(2);

            const result = await songService.getAllSongs();

            expect(mockSongModel.find).toHaveBeenCalledWith({});
            expect(result).toEqual(mockResult);
        });

        test('should throw error if retrieval fails', async () => {
            mockSongModel.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(songService.getAllSongs()).rejects.toThrow('Failed to fetch songs: Database error');
        });
    });

    describe('updateSong', () => {
        test('should update song successfully', async () => {
            const songId = 'song123';
            const updateData = {
                title: 'Updated Test Song',
                genre: 'Rock'
            };
            const mockUpdatedSong = {
                _id: songId,
                ...updateData,
                updatedAt: new Date()
            };

            mockSongModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedSong);

            const result = await songService.updateSong(songId, updateData);

            expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
                songId,
                { ...updateData, updatedAt: expect.any(Date) },
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedSong);
        });

        test('should throw error if update fails', async () => {
            const songId = 'song123';
            const updateData = { title: 'Updated Song' };

            mockSongModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await expect(songService.updateSong(songId, updateData)).rejects.toThrow('Failed to update song: Update failed');
        });
    });

    describe('deleteSong', () => {
        test('should delete song successfully', async () => {
            const songId = 'song123';

            mockSongModel.findByIdAndDelete.mockResolvedValue(true);

            const result = await songService.deleteSong(songId);

            expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith(songId);
            expect(result).toBe(true);
        });

        test('should throw error if deletion fails', async () => {
            const songId = 'song123';

            mockSongModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

            await expect(songService.deleteSong(songId)).rejects.toThrow('Failed to delete song: Delete failed');
        });
    });
});
