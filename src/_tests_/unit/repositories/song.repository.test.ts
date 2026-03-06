import { SongRepository } from '../../../repositories/song.repository';
import Song, { ISong } from '../../../models/song.model';
import mongoose from 'mongoose';

jest.mock("../../../models/song.model");

describe('SongRepository Unit Tests', () => {
    let songRepository: SongRepository;
    let mockSongModel: any;

    beforeEach(() => {
        songRepository = new SongRepository();
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

    describe('create', () => {
        test('should create a song successfully', async () => {
            const songData = {
                title: 'Test Song',
                artist: new mongoose.Types.ObjectId(),
                duration: 240,
                audioUrl: '/test-audio.mp3'
            };

            const mockSong = {
                _id: 'song123',
                ...songData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Mock the Song constructor and save method
            const mockSongInstance = {
                save: jest.fn().mockResolvedValue(mockSong)
            };
            mockSongModel.mockImplementation(() => mockSongInstance);

            const result = await songRepository.create(songData);

            expect(mockSongModel).toHaveBeenCalledWith(songData);
            expect(mockSongInstance.save).toHaveBeenCalled();
            expect(result).toEqual(mockSong);
        });

        test('should throw error if creation fails', async () => {
            const songData = {
                title: 'Test Song',
                artist: new mongoose.Types.ObjectId(),
                duration: 240,
                audioUrl: '/test-audio.mp3'
            };

            // Mock the Song constructor and save method
            const mockSongInstance = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            mockSongModel.mockImplementation(() => mockSongInstance);

            await expect(songRepository.create(songData)).rejects.toThrow('Failed to create song in database: Database error');
        });
    });

    describe('findById', () => {
        test('should find song by id successfully', async () => {
            const songId = 'song123';
            const mockSong = {
                _id: songId,
                title: 'Test Song'
            };

            mockSongModel.findById.mockResolvedValue(mockSong);

            const result = await songRepository.findById(songId);

            expect(mockSongModel.findById).toHaveBeenCalledWith(songId);
            expect(result).toEqual(mockSong);
        });

        test('should return null if song not found', async () => {
            const songId = 'nonexistent';

            mockSongModel.findById.mockResolvedValue(null);

            const result = await songRepository.findById(songId);

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        test('should find all songs successfully', async () => {
            const mockSongs = [
                { _id: 'song1', title: 'Song 1' },
                { _id: 'song2', title: 'Song 2' }
            ];

            mockSongModel.find.mockResolvedValue(mockSongs);

            const result = await songRepository.findAll();

            expect(mockSongModel.find).toHaveBeenCalled();
            expect(result).toEqual(mockSongs);
        });

        test('should handle empty songs list', async () => {
            mockSongModel.find.mockResolvedValue([]);

            const result = await songRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('updateById', () => {
        test('should update song successfully', async () => {
            const songId = 'song123';
            const updateData = {
                title: 'Updated Song',
                genre: ['Rock']
            };
            const mockUpdatedSong = {
                _id: songId,
                ...updateData,
                updatedAt: new Date()
            };

            mockSongModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedSong);

            const result = await songRepository.updateById(songId, updateData);

            expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
                songId,
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedSong);
        });

        test('should throw error if update fails', async () => {
            const songId = 'song123';
            const updateData = { title: 'Updated Song' };

            mockSongModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await expect(songRepository.updateById(songId, updateData)).rejects.toThrow('Failed to update song: Update failed');
        });
    });

    describe('deleteById', () => {
        test('should delete song successfully', async () => {
            const songId = 'song123';
            const mockDeletedSong = true; // Repository returns boolean

            mockSongModel.findByIdAndDelete.mockResolvedValue(mockDeletedSong);

            const result = await songRepository.deleteById(songId);

            expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith(songId);
            expect(result).toBe(true); // Expect boolean, not object
        });

        test('should throw error if deletion fails', async () => {
            const songId = 'song123';

            mockSongModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

            await expect(songRepository.deleteById(songId)).rejects.toThrow('Failed to delete song: Delete failed');
        });
    });

    describe('count', () => {
        test('should get songs count successfully', async () => {
            const mockCount = 42;

            mockSongModel.countDocuments.mockResolvedValue(mockCount);

            const result = await songRepository.count();

            expect(mockSongModel.countDocuments).toHaveBeenCalled();
            expect(result).toBe(mockCount);
        });
    });
});
