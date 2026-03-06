import { PlaylistService } from '../../../services/playlist.service';
import { CreatePlaylistDto } from '../../../dtos/playlist.dto';
import { HttpError } from '../../../errors/http-error';
import mongoose from 'mongoose';

// Mock the actual Playlist model to prevent database calls
jest.mock("../../../models/playlist.model");

describe('PlaylistService Unit Tests', () => {
    let playlistService: PlaylistService;
    let mockPlaylistModel: any;

    beforeEach(() => {
        playlistService = new PlaylistService();
        mockPlaylistModel = require("../../../models/playlist.model").Playlist;
        
        // Mock all model methods
        mockPlaylistModel.create = jest.fn();
        mockPlaylistModel.findById = jest.fn();
        mockPlaylistModel.find = jest.fn();
        mockPlaylistModel.findByIdAndUpdate = jest.fn();
        mockPlaylistModel.findByIdAndDelete = jest.fn();
        mockPlaylistModel.countDocuments = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPlaylist', () => {
        test('should throw error if creation fails', async () => {
            const userId = new mongoose.Types.ObjectId();
            const playlistData: CreatePlaylistDto = {
                name: 'Test Playlist'
            };

            // Mock the Playlist constructor and save method
            const mockPlaylistInstance = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            mockPlaylistModel.mockImplementation(() => mockPlaylistInstance);

            await expect(playlistService.createPlaylist(userId.toString(), playlistData)).rejects.toThrow('Failed to create playlist: Database error');
        });
    });

    describe('getPlaylistById', () => {
        test('should get playlist by id successfully', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();
            const mockPlaylist = {
                _id: playlistId,
                name: 'Test Playlist',
                userId: new mongoose.Types.ObjectId()
            };

            // Mock the populate function
            mockPlaylistModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPlaylist)
            });

            const result = await playlistService.getPlaylistById(playlistId);

            expect(mockPlaylistModel.findById).toHaveBeenCalledWith(playlistId);
            expect(result).toEqual(mockPlaylist);
        });

        test('should return null if playlist not found', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            // Mock the populate function
            mockPlaylistModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            const result = await playlistService.getPlaylistById(playlistId);
            expect(result).toBeNull();
        });

        test('should throw error if retrieval fails', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            mockPlaylistModel.findById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(playlistService.getPlaylistById(playlistId)).rejects.toThrow('Failed to fetch playlist: Database error');
        });
    });

    describe('getAllPlaylists', () => {
        test('should get all playlists successfully', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const mockPlaylists = [
                { _id: 'playlist1', name: 'Playlist 1', userId },
                { _id: 'playlist2', name: 'Playlist 2', userId }
            ];

            const mockResult = {
                playlists: mockPlaylists,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 2,
                    pages: 1
                }
            };

            // Mock the populate chain
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockPlaylists)
            };
            mockPlaylistModel.find.mockReturnValue(mockQuery);
            mockPlaylistModel.countDocuments.mockResolvedValue(2);

            const result = await playlistService.getAllPlaylists(userId);

            expect(mockPlaylistModel.find).toHaveBeenCalledWith({ userId });
            expect(result).toEqual(mockResult);
        });

        test('should throw error if retrieval fails', async () => {
            const userId = new mongoose.Types.ObjectId().toString();

            mockPlaylistModel.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(playlistService.getAllPlaylists(userId)).rejects.toThrow('Failed to fetch playlists: Database error');
        });
    });

    describe('updatePlaylist', () => {
        test('should update playlist successfully', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();
            const updateData = {
                name: 'Updated Playlist',
                description: 'Updated description'
            };
            const mockUpdatedPlaylist = {
                _id: playlistId,
                userId: new mongoose.Types.ObjectId(),
                ...updateData,
                updatedAt: new Date()
            };

            mockPlaylistModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPlaylist);

            const result = await playlistService.updatePlaylist(playlistId, updateData);

            expect(mockPlaylistModel.findByIdAndUpdate).toHaveBeenCalledWith(
                playlistId,
                { ...updateData, updatedAt: expect.any(Date) },
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedPlaylist);
        });

        test('should throw error if update fails', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();
            const updateData = { name: 'Updated Playlist' };

            mockPlaylistModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await expect(playlistService.updatePlaylist(playlistId, updateData)).rejects.toThrow('Failed to update playlist: Update failed');
        });
    });

    describe('deletePlaylist', () => {
        test('should delete playlist successfully', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            mockPlaylistModel.findByIdAndDelete.mockResolvedValue(true);

            const result = await playlistService.deletePlaylist(playlistId);

            expect(mockPlaylistModel.findByIdAndDelete).toHaveBeenCalledWith(playlistId);
            expect(result).toBe(true);
        });

        test('should throw error if deletion fails', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            mockPlaylistModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

            await expect(playlistService.deletePlaylist(playlistId)).rejects.toThrow('Failed to delete playlist: Delete failed');
        });
    });

    describe('getPlaylistSongs', () => {
        test('should get playlist songs successfully', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();
            const mockSongs = [
                { _id: 'song1', title: 'Song 1' },
                { _id: 'song2', title: 'Song 2' }
            ];

            // Mock the populate function
            mockPlaylistModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    _id: playlistId,
                    songs: mockSongs
                })
            });

            const result = await playlistService.getPlaylistSongs(playlistId);

            expect(mockPlaylistModel.findById).toHaveBeenCalledWith(playlistId);
            expect(result).toEqual(mockSongs);
        });

        test('should return empty array if playlist not found', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            // Mock the populate function
            mockPlaylistModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await expect(playlistService.getPlaylistSongs(playlistId)).rejects.toThrow('Playlist not found');
        });

        test('should throw error if retrieval fails', async () => {
            const playlistId = new mongoose.Types.ObjectId().toString();

            mockPlaylistModel.findById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(playlistService.getPlaylistSongs(playlistId)).rejects.toThrow('Failed to fetch playlist songs: Database error');
        });
    });
});
